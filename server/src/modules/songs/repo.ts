import { eq, sql } from 'drizzle-orm'
import type { Db } from '../../db/db'
import { song, type SongDb, type SongDbInsert } from '../../db/schema/song'
import {
	createSearchQuery,
	type QueryResultList,
	type RepositoryQueryParams,
} from '../../lib/dataQuery'
import type { Opt } from '../../lib/types'
import { changes } from '../../lib/utils'
import type { Song } from './model'

export interface SongQueryFilter {
	userId?: string
	collectionId?: string
}

export interface SongReporitory {
	byId(id: string): Promise<Opt<Song>>
	query(
		params?: RepositoryQueryParams<SongQueryFilter>,
	): Promise<QueryResultList<Song>>

	save(song: Song): Promise<void>
	delete(id: string): Promise<void>
}

function mapFilterKeyToDb(
	key: keyof SongQueryFilter,
	val: SongQueryFilter[keyof SongQueryFilter],
) {
	if (val == null) {
		return
	}
	switch (key) {
		case 'userId':
			return eq(song.userId, val)
		case 'collectionId':
			return eq(song.collectionId, val)
	}
}

export const createSongDbRepository = (db: Db): SongReporitory => {
	const byIdQuery = db.query.song
		.findFirst({
			where: eq(song.id, sql.placeholder('id')),
		})
		.prepare()

	const deleteQuery = db
		.delete(song)
		.where(eq(song.id, sql.placeholder('id')))
		.prepare()

	const query = createSearchQuery<typeof song, SongQueryFilter>({
		db,
		schema: song,
		mapFilterKeyToDb,
	})

	const repo = {} as SongReporitory

	repo.byId = async (id) => {
		const res = await byIdQuery.execute({ id })
		return res ? songDbToData(res) : null
	}

	repo.query = async (params) => {
		return query(params).then((res) => ({
			list: res.list.map(songDbToData),
			totalCount: res.totalCount,
		}))
	}

	repo.save = async (data) => {
		const res = await byIdQuery.execute({ id: data.id })
		if (!res) {
			await db.insert(song).values(songDataToDb(data)).execute()
		} else {
			const old = songDbToData(res)
			const diff = changes(old, data, [
				'id',
				'updatedAt',
				'userId',
				'forkedFromId',
			])
			if (Object.keys(diff).length > 0) {
				await db
					.update(song)
					.set({ ...songDiffToDb(diff), updatedAt: Date.now() })
					.where(eq(song.id, data.id))
					.execute()
			}
		}
	}

	repo.delete = async (id) => {
		await deleteQuery.execute({ id })
	}

	return repo
}

function songDbToData(db: SongDb): Song {
	return {
		id: db.id,
		updatedAt: new Date(db.updatedAt),

		userId: db.userId,
		forkedFromId: db.forkedFromId,

		isPublic: !!db.isPublic,
		collectionId: db.collectionId || null,

		data: db.data ? db.data.toString() : '',
	}
}

function songDataToDb(data: Song): SongDbInsert {
	return {
		id: data.id,
		updatedAt: data.updatedAt.getTime(),

		userId: data.userId,
		forkedFromId: data.forkedFromId,

		isPublic: data.isPublic,
		collectionId: data.collectionId || null,

		data: Buffer.from(data.data),
	}
}

function songDiffToDb(diff: Partial<Song>): Partial<SongDb> {
	const res = {} as Partial<SongDb>

	if ('collectionId' in diff) {
		res.collectionId = diff.collectionId ?? null
	}
	if ('data' in diff) {
		res.data = Buffer.from(diff.data ?? '')
	}
	if ('isPublic' in diff) {
		res.isPublic = diff.isPublic
	}

	return res
}

import { eq, sql } from 'drizzle-orm'
import type { Db } from '../../db/db'
<<<<<<< HEAD
import { songs } from '../../db/schema/songs'
import type { Opt } from '../../lib/types'
import type { Song } from './model'

interface SongList {
	list: Song[]
	totalCount: number
}

interface Pagination {
	limit?: Opt<number>
	offset?: Opt<number>
}

export interface SongRepository {
	byId: (id: string) => Promise<Song>
	byUserId: (userId: string, pagination: Pagination) => Promise<SongList>
	byCollectionId: (
		collectionId: string,
		pagination: Pagination,
	) => Promise<SongList>
	byLatest: (pagination: Pagination) => Promise<SongList>

	save: (song: Song) => Promise<void>
	delete: (id: string) => Promise<void>
}

export const createSongRepository = (db: Db): SongRepository => {
	const byIdQuery = db.query.songs
		.findFirst({
			where: eq(songs.id, sql.placeholder('id')),
		})
		.prepare()

	const byUserIdQuery = db.query.songs
		.findMany({
			where: eq(songs.userId, sql.placeholder('userId')),
			limit: sql.placeholder('limit'),
			offset: sql.placeholder('offset'),
		})
		.prepare()

	const byCollectionIdQuery = db.query.songs
		.findMany({
			where: eq(songs.collectionId, sql.placeholder('collectionId')),
			limit: sql.placeholder('limit'),
			offset: sql.placeholder('offset'),
		})
		.prepare()

	const byLatestQuery = db.query.songs
		.findMany({
			limit: sql.placeholder('limit'),
			offset: sql.placeholder('offset'),
			orderBy: [{ key: songs.updatedAt, order: 'desc' }],
		})
		.prepare()
	const repo = {} as SongRepository

	return repo
}
=======
import { song, type SongDb, type SongDbInsert } from '../../db/schema/song'
import {
	createSearchQuery,
	type QueryResultList,
	type RepositoryQueryParams,
} from '../../lib/dataQuery'
import type { Opt } from '../../lib/types'
import type { Song } from './model'
import { changes } from '../../lib/utils'

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
>>>>>>> 942d577 (add song repo)

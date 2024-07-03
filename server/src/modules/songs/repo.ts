import { eq, sql } from 'drizzle-orm'
import type { Db } from '../../db/db'
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

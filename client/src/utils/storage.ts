import { Collection, songDataSchema, SongEntity } from '@/datamodel'
import { TrpcClient } from './trpc'
import { Song as ApiSong } from '../../../server/src/modules/songs/model'

interface ListResponse<T> {
	list: T[]
	totalCount: number
}

interface Pagination {
	limit?: number
	offset?: number
}

export interface Storage {
	songsByUser(
		userId: string,
		pagination?: Pagination,
	): Promise<ListResponse<SongEntity>>
	songsByCollection(
		collectionId: string,
		pagination?: Pagination,
	): Promise<ListResponse<SongEntity>>
	songsByLatest(pagination?: Pagination): Promise<ListResponse<SongEntity>>
	songById(id: string): Promise<SongEntity>

	saveSong(song: SongEntity): Promise<SongEntity>
	deleteSong(id: string): Promise<void>

	collectionsByUser(userId: string): Promise<Collection[]>

	saveCollection(id: string, collection: Collection): Promise<void>
	deleteCollection(id: string): Promise<void>
}

export function createTrpcStorage(client: TrpcClient): Storage {
	const store = {} as Storage

	store.songsByUser = async (userId: string) => {
		const resp = await client.song.listByUser.query({ userId })
		return mapValidSongs(resp)
	}

	store.songsByCollection = async (collectionId: string) => {
		const res = await client.song.listByCollection.query({ collectionId })
		return mapValidSongs(res)
	}

	store.songsByLatest = async (pagination) => {
		const res = await client.song.listByLatest.query({ pagination })
		return mapValidSongs(res)
	}

	return store
}

function mapApiSongToLocal(song: ApiSong): SongEntity {
	const json: unknown = JSON.parse(song.data)
	const data = songDataSchema.parse(json)

	return {
		id: song.id,

		meta: {
			title: song.title,
			description: song.description ?? undefined,
			userId: song.userId,
			collection: song.collectionId ?? undefined,
			basedOn: song.forkedFromId ?? undefined,
			isPublic: song.isPublic,
			updatedAt: song.updatedAt,
		},

		data,
	}
}

function mapValidSongs(
	apiResponse: ListResponse<ApiSong>,
): ListResponse<SongEntity> {
	const list: SongEntity[] = []
	for (const song of apiResponse.list) {
		try {
			list.push(mapApiSongToLocal(song))
		} catch (err) {
			console.error('Song validation failed!', song, err)
		}
	}

	const result = {
		list,
		totalCount: apiResponse.totalCount,
	}

	return result
}

export function createDummyStorage(): Storage {
	const storage: Storage = {} as Storage

	return storage
}

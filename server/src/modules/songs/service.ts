import type { Session } from '../../context'
import type { Pagination, QueryResultList } from '../../lib/dataQuery'
import { apiError } from '../../lib/errors'
import type { Opt } from '../../lib/types'
import { uuid } from '../../lib/utils'
import type { Song, SongInput } from './model'
import type { SongReporitory } from './repo'

export interface SongService {
	byId: (session: Session, id: string) => Promise<Opt<Song>>
	listByUser: (
		session: Session,
		userId: string,
		pagination?: Pagination,
	) => Promise<QueryResultList<Song>>
	listByCollection: (
		session: Session,
		collectionId: string,
		pagination?: Pagination,
	) => Promise<QueryResultList<Song>>
	listByLatest: (
		session: Session,
		pagination?: Pagination,
	) => Promise<QueryResultList<Song>>

	save: (session: Session, song: SongInput) => Promise<Song>
	delete: (session: Session, id: string) => Promise<void>
}

export const createSongService = (repo: SongReporitory): SongService => {
	const service = {} as SongService

	service.byId = async (session, id) => {
		const song = await repo.byId(id)

		if (!song) {
			return null
		}

		if (song.userId !== session.userId) {
			if (!song.isPublic) {
				return null
			}
			if (!(await repo.isUserPublic(song.userId))) {
				return null
			}
		}

		return song
	}

	service.listByUser = async (session, userId, pagination) => {
		if (session.userId !== userId) {
			return repo.query({
				filter: { userId, currentUser: session.userId || '' },
				...pagination,
			})
		}

		return repo.query({ filter: { userId }, ...pagination })
	}

	service.listByCollection = async (session, collectionId, pagination) => {
		return repo.query({
			filter: { collectionId, currentUser: session.userId || '' },
			...pagination,
		})
	}

	service.listByLatest = async (session, pagination) => {
		return repo.query({
			filter: { currentUser: session.userId || '' },
			...pagination,
		})
	}

	service.save = async (session, song) => {
		if (!session.userId) {
			throw apiError('UNAUTHORIZED')
		}

		// validate uuid-v4
		if (
			!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
				song.id,
			)
		) {
			throw apiError('UNPROCESSABLE_CONTENT', 'Invalid song id')
		}

		const existing = await repo.byId(song.id)

		const songData = {
			...song,
			updatedAt: new Date(),
		} as Song

		if (!existing) {
			songData.userId = session.userId
			songData.isPublic = song.isPublic ?? true
			if (song.forkedFromId) {
				const forkedFrom = await repo.byId(song.forkedFromId)
				if (forkedFrom) {
					songData.forkedFromId = forkedFrom.id
				}
			}
		} else if (existing.userId !== session.userId) {
			songData.id = uuid()
			songData.userId = session.userId
			songData.forkedFromId = song.id
			songData.isPublic = song.isPublic ?? true
		}

		await repo.save(songData as Song)

		const res = await repo.byId(songData.id)

		if (!res) {
			throw apiError('INTERNAL_SERVER_ERROR', 'Failed to save song')
		}

		return res
	}

	service.delete = async (session, id) => {
		if (!session.userId) {
			throw apiError('UNAUTHORIZED')
		}

		const song = await repo.byId(id)

		if (!song) {
			return
		}

		if (song.userId !== session.userId) {
			throw apiError('UNAUTHORIZED')
		}

		await repo.delete(id)
	}

	return service
}

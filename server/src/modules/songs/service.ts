import type { Pagination, QueryResultList } from '../../lib/dataQuery'
import type { Session } from '../../lib/session'
import type { Song } from './model'
import type { SongReporitory } from './repo'

export interface SongService {
	byId: (session: Session, id: string) => Promise<Song>
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

	save: (session: Session, song: Song) => Promise<void>
	delete: (session: Session, id: string) => Promise<void>
}

export const createSongService = (repo: SongReporitory): SongService => {
	const service = {} as SongService

	return service
}

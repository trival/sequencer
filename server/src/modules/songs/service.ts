import type { Session } from '../../lib/session'
import type { Song } from './model'

export interface SongService {
	byId: (session: Session, id: string) => Promise<Song>
	listByUser: (session: Session, userId: string) => Promise<Song[]>
	listByCollection: (session: Session, collectionId: string) => Promise<Song[]>
	listByLatest: (session: Session) => Promise<Song[]>

	save: (session: Session, song: Song) => Promise<void>
	delete: (session: Session, id: string) => Promise<void>
}

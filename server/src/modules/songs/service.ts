import type { Song } from './model'

export interface SongService {
	byId: (id: string) => Promise<Song>
	listByUser: (userId: string) => Promise<Song[]>
	listByCollection: (collectionId: string) => Promise<Song[]>
	listByLatest: () => Promise<Song[]>

	save: (song: Song) => Promise<void>
	delete: (id: string) => Promise<void>
}

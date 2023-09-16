import { Collection, Profile, Song } from './datamodel'

export interface AppState {
	profile: Profile | null
	collections: Collection[]
	songs: Song[]

	openSongs: Song[]
	currentSong: string | null
	playingSong: string | null
}

export interface AppActions {
	setProfile: (profile: Profile | null) => void

	openSong(id: string): void
	openNewSong(): void
	openSongCopy(id: string): void

	closeSong(id: string): void

	saveSong(id: string): void
	saveSongMeta(id: string, meta: Partial<Song>): void
	deleteSong(id: string): void
}

import { ParentProps, createContext, useContext } from 'solid-js'
import { Collection, Profile, Song } from './datamodel'
import { createStore } from 'solid-js/store'
import { Storage } from './utils/storage'

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

function emptyAppState(): AppState {
	return {
		profile: null,
		collections: [],
		songs: [],
		openSongs: [],
		currentSong: null,
		playingSong: null,
	}
}

type AppCtx = [AppState, AppActions]

const ctx = createContext<AppCtx>([emptyAppState(), {} as AppActions])

export const AppStateProvider = (props: ParentProps<{ storage: Storage }>) => {
	const [state, _setState] = createStore<AppState>(emptyAppState())

	const actions: AppActions = {
		setProfile: function (profile: Profile | null): void {
			throw new Error('Function not implemented.')
		},
		openSong: function (id: string): void {
			throw new Error('Function not implemented.')
		},
		openNewSong: function (): void {
			throw new Error('Function not implemented.')
		},
		openSongCopy: function (id: string): void {
			throw new Error('Function not implemented.')
		},
		closeSong: function (id: string): void {
			throw new Error('Function not implemented.')
		},
		saveSong: function (id: string): void {
			throw new Error('Function not implemented.')
		},
		saveSongMeta: function (id: string, meta: Partial<Song>): void {
			throw new Error('Function not implemented.')
		},
		deleteSong: function (id: string): void {
			throw new Error('Function not implemented.')
		},
	}

	return <ctx.Provider value={[state, actions]}>{props.children}</ctx.Provider>
}

export function useAppState(): AppCtx {
	return useContext(ctx)
}

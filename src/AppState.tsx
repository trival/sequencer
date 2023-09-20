import { ParentProps, createContext, createEffect, useContext } from 'solid-js'
import { Collection, Profile, Song } from './datamodel'
import { createStore } from 'solid-js/store'
import { Storage } from './utils/storage'
import { Session } from './utils/session'

export interface AppState {
	profile: Profile | null
	collections: Collection[]
	songs: Song[]

	openSongs: Song[]
	currentSong: string | null
	playingSong: string | null
}

export interface AppActions {
	updateProfile: (profile: Partial<Profile>) => void

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

export const AppStateProvider = (
	props: ParentProps<{ storage: Storage; session: Session }>,
) => {
	const [state, _setState] = createStore<AppState>(emptyAppState())

	createEffect(() => {
		let userId = props.session.userId()
		if (userId) {
			props.storage
				.getProfile(userId)
				.then((profile) => {
					_setState('profile', profile)
				})
				.catch((err) => {
					console.log(err)
					_setState('profile', userId ? { userId } : null)
				})
		} else {
			_setState('profile', null)
		}
	})

	const actions: AppActions = {
		updateProfile: function (profile): void {
			throw new Error('Function not implemented.')
		},
		openSong: function (id): void {
			throw new Error('Function not implemented.')
		},
		openNewSong: function (): void {
			throw new Error('Function not implemented.')
		},
		openSongCopy: function (id): void {
			throw new Error('Function not implemented.')
		},
		closeSong: function (id): void {
			throw new Error('Function not implemented.')
		},
		saveSong: function (id): void {
			throw new Error('Function not implemented.')
		},
		saveSongMeta: function (id, meta): void {
			throw new Error('Function not implemented.')
		},
		deleteSong: function (id): void {
			throw new Error('Function not implemented.')
		},
	}

	return <ctx.Provider value={[state, actions]}>{props.children}</ctx.Provider>
}

export function useAppState(): AppCtx {
	return useContext(ctx)
}

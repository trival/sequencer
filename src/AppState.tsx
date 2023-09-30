import {
	ParentProps,
	createContext,
	createEffect,
	createMemo,
	useContext,
} from 'solid-js'
import { Collection, Profile, Song, SongData, SongMeta } from './datamodel'
import { createStore } from 'solid-js/store'
import { Storage } from './utils/storage'
import { Session } from './utils/session'
import { emptySong, emptySongData } from './utils/song'

export interface AppState {
	profile: Profile | null
	collections: Collection[]
	songs: Song[]

	openSongs: Song[]
	currentSong: Song | null
	playingSong: string | null
}

export interface AppActions {
	updateProfile: (profile: Partial<Profile>) => void

	openSong(id: string): void
	openNewSong(): void
	openSongCopy(id: string): void

	closeSong(id: string): void

	saveSong(id: string, data: SongData): void
	saveSongMeta(id: string, meta: SongMeta): void
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
	const [state, setState] = createStore<AppState>(emptyAppState())

	const songsById = createMemo(() => {
		const res = new Map<string, Song>()
		for (const song of state.songs) {
			res.set(song.id, song)
		}
		return res
	})

	createEffect(() => {
		const userId = props.session.userId()
		if (userId) {
			props.storage
				.getProfile(userId)
				.then((profile) => {
					setState('profile', profile)
				})
				.catch((err) => {
					console.log(err)
					setState('profile', userId ? { userId } : null)
				})
				// eslint-disable-next-line solid/reactivity
				.then(async () => {
					if (userId) {
						const collections = await props.storage.collectionsByUser(userId)
						const songs = await props.storage.songsByUser(userId)
						setState({ collections, songs })
					}
				})
		} else {
			setState({
				profile: null,
				collections: [],
				songs: [],
				openSongs: [],
				currentSong: null,
				playingSong: null,
			})
		}
	})

	const actions: AppActions = {
		async updateProfile(profile) {
			if (!state.profile?.userId) {
				return
			}

			if (state.profile.username) {
				await props.storage.updateProfile(state.profile.userId, {
					username: profile.username,
					color: profile.color,
				})
			} else if (profile.username) {
				if (!profile.color) {
					profile.color =
						'#' +
						Math.floor(Math.random() * 255).toString(16) +
						Math.floor(Math.random() * 255).toString(16) +
						Math.floor(Math.random() * 255).toString(16)
				}

				await props.storage.createProfile({
					userId: state.profile.userId,
					username: profile.username,
					color: profile.color,
				})
			}

			setState('profile', {
				...state.profile,
				username: profile.username,
				color: profile.color,
			})
		},
		openSong: function (id): void {
			setState('currentSong', songsById().get(id) || null)
		},
		openNewSong: function (): void {
			setState('currentSong', emptySong())
		},
		openSongCopy: function (id): void {
			const song = songsById().get(id)
			if (song) {
				setState('currentSong', {
					...song,
					id: emptySong().id,
					meta: {
						...song.meta,
						title: (song.meta.title || '') + ' (copy)',
					},
				})
			}
		},
		closeSong: function (id): void {
			if (state.currentSong?.id === id) {
				setState('currentSong', null)
			}
			setState(
				'openSongs',
				state.openSongs.filter((s) => s.id !== id),
			)
		},
		saveSong: function (id, data): void {
			if (!id) return
			const song = songsById().get(id)
			if (song) {
				props.storage.updateSong(id, { data }).catch(console.error)
			} else if (id === state.currentSong?.id && state.profile?.userId) {
				const song = {
					id,
					meta: {
						userId: state.profile.userId,
					},
					data,
				}
				props.storage
					.createSong(song)
					// eslint-disable-next-line solid/reactivity
					.then(() => {
						setState('songs', [...state.songs, song])
					})
					.catch(console.error)
			}
		},
		saveSongMeta: function (id, meta): void {
			if (!id) return
			const song = songsById().get(id)
			if (song) {
				props.storage.updateSong(id, { meta }).catch(console.error)
			} else if (id === state.currentSong?.id && state.profile?.userId) {
				const song = {
					id,
					meta: {
						...meta,
						userId: state.profile.userId,
					},
					data: emptySongData(),
				}
				props.storage
					.createSong(song)
					// eslint-disable-next-line solid/reactivity
					.then(() => {
						setState('songs', [...state.songs, song])
					})
					.catch(console.error)
			}
		},
		deleteSong: function (id): void {
			if (!id) return
			const song = songsById().get(id)
			if (song) {
				props.storage.deleteSong(id).catch(console.error)
				setState(
					'songs',
					state.songs.filter((s) => s.id !== id),
				)
			}
			if (state.currentSong?.id === id) {
				setState('currentSong', null)
			}
		},
	}

	return <ctx.Provider value={[state, actions]}>{props.children}</ctx.Provider>
}

export function useAppState(): AppCtx {
	return useContext(ctx)
}

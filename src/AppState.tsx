import { ParentProps, createContext, createEffect, useContext } from 'solid-js'
import { Collection, Profile, SongEntity } from './datamodel'
import { createStore } from 'solid-js/store'
import { Storage } from './utils/storage'
import { Session } from './utils/session'
import { emptySongEntity } from './utils/song'

export interface AppState {
	profile: Profile | null
	collections: { [id: string]: Collection }
	songs: { [id: string]: SongEntity }

	openSongIds: string[]
	currentSongId: string | null
}

export interface AppActions {
	updateProfile: (profile: Partial<Profile>) => void
	logout: () => void

	openSong(id: string): void
	openNewSong(): void
	openSongCopy(id: string): void

	closeSong(id: string): void

	saveSong(id: string, song: SongEntity): void
	deleteSong(id: string): void
}

function emptyAppState(): AppState {
	return {
		profile: null,
		collections: {},
		songs: {},
		openSongIds: [],
		currentSongId: null,
	}
}

type AppCtx = [AppState, AppActions]

const ctx = createContext<AppCtx>([emptyAppState(), {} as AppActions])

export const AppStateProvider = (
	props: ParentProps<{ storage: Storage; session: Session }>,
) => {
	const [state, setState] = createStore<AppState>(emptyAppState())

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

						const songsById: { [id: string]: SongEntity } = {}
						songs.forEach((s) => {
							songsById[s.id] = s
						})

						const collectionsById: { [id: string]: Collection } = {}
						collections.forEach((c) => {
							collectionsById[c.id] = c
						})

						setState({ collections: collectionsById, songs: songsById })
					}
				})
		} else {
			setState(emptyAppState())
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

		logout() {
			props.session.logout()
			setState(emptyAppState())
		},

		openSong(id) {
			setState('currentSongId', state.songs[id] ? id : null)
			const openSongs = new Set(state.openSongIds)
			openSongs.add(id)
			setState('openSongIds', [...openSongs])
		},

		openNewSong() {
			const newSong = emptySongEntity()
			setState('songs', newSong.id, newSong)
			setState('currentSongId', newSong.id)
		},

		openSongCopy(id) {
			const song = state.songs[id]
			if (song) {
				const newSong = emptySongEntity()
				setState('currentSongId', newSong.id)
				setState('songs', newSong.id, {
					...song,
					id: emptySongEntity().id,
					meta: {
						...song.meta,
						title: (song.meta.title || '') + ' (copy)',
					},
				})
			}
		},

		closeSong(id) {
			if (state.currentSongId === id) {
				setState('currentSongId', null)
			}
			setState(
				'openSongIds',
				state.openSongIds.filter((openId) => openId !== id),
			)
		},

		saveSong(id, data) {
			const song = state.songs[id]
			if (song) {
				if (song.meta.createdAt && state.profile?.userId === song.meta.userId) {
					props.storage
						.updateSong(id, data)
						.then(() => {
							setState('songs', song.id, data)
						})
						.catch(console.error)
				} else if (state.profile?.userId) {
					const newSong = {
						...data,
						meta: {
							...data.meta,
							userId: state.profile.userId,
						},
					}
					props.storage
						.createSong(newSong)
						.then(() => {
							setState('songs', song.id, newSong)
						})
						.catch(console.error)
				}
			}
		},

		deleteSong(id) {
			if (!id) return
			const song = state.songs[id]
			if (song) {
				if (song.meta.createdAt) {
					props.storage.deleteSong(id).catch(console.error)
				}

				const songs = Object.fromEntries(
					Object.entries(state.songs).filter(([key]) => key !== id),
				)
				setState('songs', songs)
			}
			if (state.currentSongId === id) {
				setState('currentSongId', null)
			}
		},
	}

	return <ctx.Provider value={[state, actions]}>{props.children}</ctx.Provider>
}

export function useAppState(): AppCtx {
	return useContext(ctx)
}

import { ParentProps, createContext, createEffect, useContext } from 'solid-js'
import { Collection, SongEntity } from './datamodel'
import { createStore } from 'solid-js/store'
import { Storage } from './utils/storage'
import { Profile, Session } from './utils/session'
import { emptySongEntity } from './utils/song'
import { useNavigate } from '@solidjs/router'

export interface AppState {
	profile: Profile | null
	collections: { [id: string]: Collection }
	songs: { [id: string]: SongEntity }
}

export interface AppActions {
	updateProfile: (profile: Partial<Profile>) => void
	logout: () => void

	openNewSong(): void
	openSongCopy(id: string): void

	saveSong(id: string, song: SongEntity): void
	deleteSong(id: string): void
}

function emptyAppState(): AppState {
	return {
		profile: null,
		collections: {},
		songs: {},
	}
}

type AppCtx = [AppState, AppActions]

const ctx = createContext<AppCtx>([emptyAppState(), {} as AppActions])

export const AppStateProvider = (
	props: ParentProps<{ storage: Storage; session: Session }>,
) => {
	const [state, setState] = createStore<AppState>(emptyAppState())
	const navigate = useNavigate()

	createEffect(() => {
		const profile = props.session.profile()
		if (profile) {
			setState('profile', profile)
			props.storage
				.collectionsByUser(profile.userId)
				// eslint-disable-next-line solid/reactivity
				.then((collections) =>
					props.storage.songsByUser(profile.userId).then((songs) => {
						const songsById: { [id: string]: SongEntity } = {}
						songs.list.forEach((s) => {
							songsById[s.id] = s
						})

						const collectionsById: { [id: string]: Collection } = {}
						collections.forEach((c) => {
							collectionsById[c.id] = c
						})

						setState({ collections: collectionsById, songs: songsById })
					}),
				)
				.catch(console.error)
		} else {
			setState(emptyAppState())
		}
	})

	const actions: AppActions = {
		async updateProfile(profile) {
			if (!state.profile?.userId) {
				return
			}

			// TODO
			// await props.storage.updateProfile(state.profile.userId, {
			// 	username: profile.username,
			// 	color: profile.color,
			// })

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

		openNewSong() {
			const newSong = emptySongEntity()
			setState('songs', newSong.id, newSong)
			navigate(`/songs/${newSong.id}`)
		},

		openSongCopy(id) {
			const song = state.songs[id]
			if (song) {
				const newSong = emptySongEntity()
				setState('songs', newSong.id, {
					id: newSong.id,
					meta: {
						...newSong.meta,
						basedOn: song.id,
						title: `${song.meta.title} (copy)`,
					},
					data: { ...song.data },
				})
				navigate(`/songs/${newSong.id}`)
			}
		},

		saveSong(id, data) {
			const song = state.songs[id]
			if (song) {
				props.storage
					.saveSong(song)
					.then((res) => {
						setState('songs', res.id, res)
						navigate(`/songs/${res.id}`)
					})
					.catch(console.error)
			}
		},

		deleteSong(id) {
			if (!id) return
			const song = state.songs[id]
			if (song) {
				if (song.meta.updatedAt) {
					props.storage.deleteSong(id).catch(console.error)
				}

				const songs = Object.fromEntries(
					Object.entries(state.songs).filter(([key]) => key !== id),
				)
				setState('songs', songs)
			}
		},
	}

	return <ctx.Provider value={[state, actions]}>{props.children}</ctx.Provider>
}

export function useAppState(): AppCtx {
	return useContext(ctx)
}

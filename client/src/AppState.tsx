import { ParentProps, createContext, createEffect, useContext } from 'solid-js'
import { Collection, SongEntity } from './datamodel'
import { createStore } from 'solid-js/store'
import { Storage } from './utils/storage'
import { Profile, Session } from './utils/session'
import { emptySongEntity } from './utils/song'
import { useNavigate } from '@solidjs/router'

interface SongStateData {
	initialData: SongEntity
	changes: SongEntity[]
	currentChangeIdx: number
}

export interface AppState {
	profile: Profile | null
	collections: { [id: string]: Collection }
	songs: {
		[id: string]: SongStateData
	}
}

export function getCurrentSongDraft(
	data?: SongStateData | null | undefined,
): SongEntity | null {
	return data?.changes[data?.currentChangeIdx] ?? null
}

export interface AppActions {
	updateProfile: (profile: Partial<Profile>) => void

	session: () => Session
	logout: () => void

	openNewSong(): void
	openSongCopy(id: string): void

	updateSong(data: SongEntity): void
	syncSongWithRemote(id: string): void

	deleteSong(id: string): void
}

function emptyAppState(): AppState {
	return {
		profile: null,
		collections: {},
		songs: {},
	}
}

function songStateDataFromEntity(song: SongEntity): SongStateData {
	return {
		initialData: song,
		changes: [{ ...song }],
		currentChangeIdx: 0,
	}
}

function emptySongStateData(): SongStateData {
	return songStateDataFromEntity(emptySongEntity())
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
						const songsById: { [id: string]: SongStateData } = {}
						songs.list.forEach((s) => {
							songsById[s.id] = songStateDataFromEntity(s)
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

		session: () => props.session,

		logout() {
			props.session.logout()
			setState(emptyAppState())
		},

		openNewSong() {
			const newSong = emptySongStateData()
			const id = newSong.initialData.id
			setState('songs', id, newSong)
			navigate(`/songs/${id}`)
		},

		openSongCopy(id) {
			const song = getCurrentSongDraft(state.songs[id])
			if (song) {
				let newSong = emptySongEntity()
				newSong = {
					id: newSong.id,
					meta: {
						...newSong.meta,
						basedOn: song.id,
						title: `${song.meta.title} (copy)`,
					},
					data: { ...song.data },
				}
				setState('songs', newSong.id, songStateDataFromEntity(newSong))
				navigate(`/songs/${newSong.id}`)
			}
		},

		updateSong(data) {
			const songState = state.songs[data.id]
			if (songState) {
				const updatedSongState = {
					...songState,
					changes: [...songState.changes, data],
					currentChangeIdx: songState.currentChangeIdx + 1,
				}
				setState('songs', data.id, updatedSongState)
			}
		},

		syncSongWithRemote(id) {
			const song = getCurrentSongDraft(state.songs[id])
			if (song) {
				props.storage
					.saveSong(song)
					.then((res) => {
						setState('songs', res.id, songStateDataFromEntity(res))
						navigate(`/songs/${res.id}`)
					})
					.catch(console.error)
			}
		},

		deleteSong(id) {
			if (!id) return
			const song = getCurrentSongDraft(state.songs[id])
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

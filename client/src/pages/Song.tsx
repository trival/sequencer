import { getCurrentSongDraft, useAppState } from '@/AppState'
import { Login } from '@/components/loginForm'
import PlayerUI from '@/components/player'
import { Subpage } from '@/components/shared/simpleSubpage'
import NavBar from '@/components/songNav'
import {
	defaultEditorSettings,
	defaultKeyboardSettings,
	EditorSettings,
	KeyboardSettings,
	Song,
	SongMeta,
} from '@/datamodel'
import { createSongState, emptySongEntity } from '@/utils/song'
import { createPlayer } from '@/utils/songPlayer'
import { createSynth } from '@/utils/synth'
import { useParams } from '@solidjs/router'
import { createMemo, Show } from 'solid-js'

export default function App() {
	const params = useParams()
	const [state, { syncSongWithRemote, updateSong: updateSongDraft, logout }] =
		useAppState()

	const currentSong = createMemo(() => {
		const song = getCurrentSongDraft(state.songs[params.id])
		return song ?? null
	})

	const synth = createMemo(() => {
		return createSynth(currentSong()?.data.song.instruments)
	})

	const player = createMemo(() => {
		return createPlayer(synth())
	})

	const keyboardSettings = createMemo(() => {
		return {
			...defaultKeyboardSettings,
			...currentSong()?.data.keyboardSettings,
		} as KeyboardSettings
	})

	const editorSettings = createMemo(() => {
		return {
			...defaultEditorSettings,
			...currentSong()?.data.editorSettings,
		} as EditorSettings
	})

	function updateSong(songData: Song) {
		const song = currentSong()
		if (song) {
			updateSongDraft({ ...song, data: { ...song.data, song: songData } })
		}
	}

	const songState = createMemo(() => {
		const defaultSong = emptySongEntity()
		const song = () => currentSong()?.data.song || defaultSong.data.song
		return createSongState(
			song,
			updateSong,
			editorSettings().defaultNoteDuration,
		)
	})

	function updateSongMeta(id: string, meta: Partial<SongMeta>) {
		const song = getCurrentSongDraft(state.songs[id])
		if (song) {
			const updatedSong = {
				...song,
				meta: { ...song.meta, ...meta },
			}
			updateSongDraft(updatedSong)
		}
	}

	function updateKeyboardSettings(settings: Partial<KeyboardSettings>) {
		const song = currentSong()
		if (song) {
			updateSongDraft({
				...song,
				data: {
					...song.data,
					keyboardSettings: {
						...song.data.keyboardSettings,
						...settings,
					},
				},
			})
		}
	}

	// TODO
	// function updateEditorSettings(settings: Partial<EditorSettings>) {
	// 	const song = currentSong()
	// 	if (song) {
	// 		updateSongDraft({
	// 			...song,
	// 			data: {
	// 				...song.data,
	// 				editorSettings: {
	// 					...song.data.editorSettings,
	// 					...settings,
	// 				},
	// 			},
	// 		})
	// 	}
	// }

	return (
		<Show
			when={state.profile}
			fallback={
				<Subpage>
					<div class="m-auto my-4 w-full max-w-[420px] rounded-lg bg-white p-6 shadow sm:p-12 md:my-16">
						<Login />
					</div>
				</Subpage>
			}
		>
			<NavBar
				currentSong={currentSong()}
				onUpdateSongMeta={(id, meta) => {
					updateSongMeta(id, meta)
				}}
				onLogout={() => logout()}
				keyboardSettings={keyboardSettings()}
				onUpdateKeyboardSettings={(settings) => {
					updateKeyboardSettings(settings)
				}}
			/>
			<Show when={currentSong()}>
				<PlayerUI
					onSave={() => {
						syncSongWithRemote(currentSong()!.id)
					}}
					songState={songState()}
					songPlayer={player()}
					synth={synth()}
					editorSettings={editorSettings()}
					keyboardSettings={keyboardSettings()}
				/>
			</Show>
		</Show>
	)
}

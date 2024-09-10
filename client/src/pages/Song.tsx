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
} from '@/datamodel'
import { createSongActions, emptySongEntity } from '@/utils/song'
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

	const songActions = createMemo(() => {
		const defaultSong = emptySongEntity()
		const song = () => currentSong()?.data.song || defaultSong.data.song
		return createSongActions(
			song,
			updateSong,
			editorSettings().defaultNoteDuration,
		)
	})

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
				onUpdateSong={updateSongDraft}
				onLogout={() => logout()}
			/>
			<Show when={currentSong()}>
				<PlayerUI
					songData={currentSong()!.data}
					onSongDataChanged={(songData) =>
						updateSongDraft({ ...currentSong()!, data: songData })
					}
					onSave={() => {
						syncSongWithRemote(currentSong()!.id)
					}}
					songActions={songActions()}
					songPlayer={player()}
					synth={synth()}
					editorSettings={editorSettings()}
					keyboardSettings={keyboardSettings()}
				/>
			</Show>
		</Show>
	)
}

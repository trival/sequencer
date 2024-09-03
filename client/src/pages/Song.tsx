import { useAppState } from '@/AppState'
import { Login } from '@/components/loginForm'
import PlayerUI from '@/components/player'
import { Subpage } from '@/components/shared/simpleSubpage'
import NavBar from '@/components/songNav'
import { defaultEditorSettings, SongMeta } from '@/datamodel'
import { createSongState, emptySongEntity } from '@/utils/song'
import { createPlayer } from '@/utils/songPlayer'
import { createSynth } from '@/utils/synth'
import { useParams } from '@solidjs/router'
import { Show, createMemo } from 'solid-js'

export default function App() {
	const params = useParams()
	const [state, { uploadDraft: saveSong, logout }] = useAppState()

	const currentSong = createMemo(
		() => (params.id && state.songs[params.id]) || null,
	)

	const synth = createMemo(() => {
		return createSynth(currentSong()?.data.song.instruments)
	})

	const player = createMemo(() => {
		return createPlayer(synth())
	})

	const keyboardSettings = createMemo(() => {
		return currentSong()?.data.keyboardSettings
	})

	const editorSettings = createMemo(() => {
		return currentSong()?.data.editorSettings
	})

	const songState = createMemo(() => {
		const defaultSong = emptySongEntity()
		const song = () => currentSong()?.data.song || defaultSong.data.song
		return createSongState(
			song,
			editorSettings()?.defaultNoteDuration ||
				defaultEditorSettings.defaultNoteDuration,
		)
	})

	function saveSongMeta(id: string, meta: Partial<SongMeta>) {
		const song = state.songs[id]
		if (song) {
			const updatedSong = {
				...song,
				meta: { ...song.meta, ...meta },
			}
			if (song.id === currentSong()?.id) {
				updatedSong.data = {
					song: songState().data(),
					editorSettings: editorState().data(),
					keyboardSettings: keyboardState().data(),
				}
			}
			saveSong(id, updatedSong)
		}
	}

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
					saveSongMeta(id, meta)
				}}
				onLogout={() => logout()}
				keyboardState={currentSong() ? keyboardState() : undefined}
			/>
			<Show when={currentSong()}>
				<PlayerUI
					onSave={(songData) => {
						const song = currentSong()!
						saveSong(song.id, { ...song, data: songData })
					}}
					songState={songState()}
					songPlayer={player()}
					synth={synth()}
					editorSettings={editorState().data()}
					keyboardSettings={keyboardState().data()}
				/>
			</Show>
		</Show>
	)
}

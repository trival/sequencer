import { Show, createMemo } from 'solid-js'
import { useAppState } from '@/AppState'
import ProfileForm from '@/components/profileForm'
import NavBar from '@/components/songNav'
import PlayerUI from '@/components/player'
import { createPlayer } from '@/utils/songPlayer'
import { createSynth } from '@/utils/synth'
import { emptySongEntity, createSongState } from '@/utils/song'
import {
	createEditorSettingState,
	createKeyboardSettingState,
} from '@/utils/settings'
import { SongMeta } from '@/datamodel'
import { Subpage } from '@/components/shared/SimpleSubpage'
import { LogoutButton } from '@/components/buttons'
import { useParams } from '@solidjs/router'

export default function App() {
	const params = useParams()
	const [state, { updateProfile, saveSong, logout }] = useAppState()

	const currentSong = createMemo(
		() => (params.id && state.songs[params.id]) || null,
	)

	const synth = createMemo(() => {
		return createSynth(currentSong()?.data.song.instruments)
	})

	const player = createMemo(() => {
		return createPlayer(synth())
	})

	const keyboardState = createMemo(() => {
		return createKeyboardSettingState(currentSong()?.data.keyboardSettings)
	})

	const editorState = createMemo(() => {
		return createEditorSettingState(currentSong()?.data.editorSettings)
	})

	const songState = createMemo(() => {
		const song = currentSong() || emptySongEntity()
		return createSongState(song.data.song, editorState().data())
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
						TODO: Add a login/register form here
					</div>
				</Subpage>
			}
		>
			{state.profile?.username ? (
				<>
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
							song={songState()}
							songPlayer={player()}
							synth={synth()}
							editorSettings={editorState().data()}
							keyboardSettings={keyboardState().data()}
						/>
					</Show>
				</>
			) : (
				<Subpage navOpts={<LogoutButton onLogout={() => logout()} />}>
					<div class="m-auto my-4 bg-white px-6 py-12 shadow sm:w-full sm:max-w-[480px] sm:rounded-lg sm:px-12 md:my-16">
						<ProfileForm
							username=""
							onSubmit={(username, color) => {
								updateProfile({ username, color })
							}}
						/>
					</div>
				</Subpage>
			)}
		</Show>
	)
}

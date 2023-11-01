import { Show, createMemo } from 'solid-js'
import { useAppState } from '@/AppState'
import ProfileForm from '@/components/profileForm'
import { supabase } from '@/utils/supabase'
import { Auth } from '@supabase/auth-ui-solid'
import ProfileSongList from '@/components/profileList'
import NavBar from '@/components/songNav'
import PlayerUI from '@/components/player'
import { createPlayer } from '@/utils/songPlayer'
import { createSynth } from '@/utils/synth'
import { emptySongEntity, createSongState } from '@/utils/song'
import {
	createEditorSettingState,
	createKeyboardSettingState,
} from '@/utils/settings'

export default function App() {
	const [state, { updateProfile, saveSong }] = useAppState()

	const currentSong = createMemo(
		() => (state.currentSongId && state.songs[state.currentSongId]) || null,
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

	return (
		<div class="flex min-h-full flex-col justify-center">
			{state.profile ? (
				state.profile.username ? (
					<>
						<NavBar />
						<Show when={currentSong()} fallback={<ProfileSongList />}>
							<PlayerUI
								onSave={(songData) => saveSong(currentSong()!.id, songData)}
								song={songState()}
								songPlayer={player()}
								synth={synth()}
								editorSettings={editorState().data()}
								keyboardSettings={keyboardState().data()}
							/>
						</Show>
					</>
				) : (
					<div class="m-auto my-4 bg-white px-6 py-12 shadow sm:w-full sm:max-w-[480px] sm:rounded-lg sm:px-12 md:my-16">
						<ProfileForm
							username=""
							onSubmit={(username, color) => {
								updateProfile({ username, color })
							}}
						/>
					</div>
				)
			) : (
				<div class="m-auto my-4 bg-white px-6 py-12 shadow sm:w-full sm:max-w-[480px] sm:rounded-lg sm:px-12 md:my-16">
					<Auth supabaseClient={supabase} />
				</div>
			)}
		</div>
	)
}

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

export default function App() {
	const [state, { updateProfile, saveSong }] = useAppState()

	const currentSong = createMemo(
		() => (state.currentSongId && state.songs[state.currentSongId]) || null,
	)

	const synth = createMemo(() => {
		if (!currentSong()) return null
		return createSynth(currentSong()!.data.instruments)
	})

	const songPlayer = createMemo(() => {
		if (!synth()) return null
		return createPlayer(synth()!)
	})

	return (
		<div class="flex min-h-full flex-col justify-center">
			{state.profile ? (
				state.profile.username ? (
					<>
						<NavBar />
						<Show
							when={currentSong() && synth() && songPlayer()}
							fallback={<ProfileSongList />}
						>
							<PlayerUI
								onSave={(songData) => saveSong(currentSong()!.id, songData)}
								song={currentSong()!.data}
								songPlayer={songPlayer()!}
								synth={synth()!}
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

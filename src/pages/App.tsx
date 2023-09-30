import { Show } from 'solid-js'
import { useAppState } from '@/AppState'
import ProfileForm from '@/components/profileForm'
import { supabase } from '@/utils/supabase'
import { Auth } from '@supabase/auth-ui-solid'
import ProfileSongList from '@/components/profileList'
import NavBar from '@/components/songNav'
import Player from '@/components/player'

export default function App() {
	const [state, { updateProfile, saveSong }] = useAppState()

	return (
		<div class="flex min-h-full flex-col justify-center">
			{state.profile ? (
				state.profile.username ? (
					<>
						<NavBar />
						<Show when={state.currentSong} fallback={<ProfileSongList />}>
							<Player
								onSave={(songData) =>
									state.currentSong && saveSong(state.currentSong.id, songData)
								}
								song={state.currentSong!.data}
							/>
						</Show>
					</>
				) : (
					<div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12 sm:w-full sm:max-w-[480px] m-auto my-4 md:my-16">
						<ProfileForm
							onSubmit={(username, color) => {
								updateProfile({ username, color })
							}}
						/>
					</div>
				)
			) : (
				<div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12 sm:w-full sm:max-w-[480px] m-auto my-4 md:my-16">
					<Auth supabaseClient={supabase} />
				</div>
			)}
		</div>
	)
}

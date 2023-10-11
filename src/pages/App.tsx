import { Show, createMemo } from 'solid-js'
import { useAppState } from '@/AppState'
import ProfileForm from '@/components/profileForm'
import { supabase } from '@/utils/supabase'
import { Auth } from '@supabase/auth-ui-solid'
import ProfileSongList from '@/components/profileList'
import NavBar from '@/components/songNav'
import Player from '@/components/player'

export default function App() {
	const [state, { updateProfile, saveSong }] = useAppState()
	const currentSong = createMemo(
		() => (state.currentSongId && state.songs[state.currentSongId]) || null,
	)

	return (
		<div class="flex min-h-full flex-col justify-center">
			{state.profile ? (
				state.profile.username ? (
					<>
						<NavBar />
						<Show when={currentSong()} fallback={<ProfileSongList />}>
							<Player
								onSave={(songData) => saveSong(currentSong()!.id, songData)}
								song={currentSong()!.data}
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

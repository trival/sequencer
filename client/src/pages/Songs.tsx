import { Show } from 'solid-js'
import { useAppState } from '@/AppState'
import ProfileSongList from '@/components/profileList'
import NavBar from '@/components/songNav'
import { Subpage } from '@/components/shared/simpleSubpage'

export default function App() {
	const [state, { logout }] = useAppState()

	return (
		<Show
			when={state.profile}
			fallback={
				<Subpage>
					<div class="m-auto my-4 w-full max-w-[420px] rounded-lg bg-white p-6 shadow sm:p-12 md:my-16">
						TODO: Login/Register form
					</div>
				</Subpage>
			}
		>
			<NavBar currentSong={null} onLogout={() => logout()} />
			<ProfileSongList class="p-6 lg:p-8" />
		</Show>
	)
}

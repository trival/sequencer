import { Show } from 'solid-js'
import { useAppState } from '@/AppState'
import ProfileForm from '@/components/profileForm'
import ProfileSongList from '@/components/profileList'
import NavBar from '@/components/songNav'
import { Subpage } from '@/components/shared/SimpleSubpage'
import { LogoutButton } from '@/components/buttons'

export default function App() {
	const [state, { logout, updateProfile }] = useAppState()

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
			{state.profile?.username ? (
				<>
					<NavBar currentSong={null} onLogout={() => logout()} />
					<ProfileSongList class="p-6 lg:p-8" />
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

import { useAppState } from '@/AppState'
import ProfileForm from '@/components/profileForm'
import { supabase } from '@/utils/supabase'
import { Auth } from '@supabase/auth-ui-solid'

export default function App() {
	const [state, { updateProfile }] = useAppState()

	return (
		<div class="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div class="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
				<div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
					{state.profile ? (
						state.profile.username ? (
							<p>Logged in as {state.profile.username}</p>
						) : (
							<ProfileForm
								onSubmit={(username, color) => {
									updateProfile({ username, color })
								}}
							/>
						)
					) : (
						<Auth supabaseClient={supabase} />
					)}
				</div>
			</div>
		</div>
	)
}

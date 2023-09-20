import { useAppState } from '@/AppState'
import { supabase } from '@/utils/supabase'
import { Auth } from '@supabase/auth-ui-solid'

export default function App() {
	const [state] = useAppState()

	return (
		<>
			{state.profile ? (
				state.profile.username ? (
					<p>Logged in as {state.profile.username}</p>
				) : (
					<p>TODO: create profile, enter username</p>
				)
			) : (
				<Auth supabaseClient={supabase} />
			)}
		</>
	)
}

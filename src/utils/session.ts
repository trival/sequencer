import { SupabaseClient } from '@supabase/supabase-js'
import { createSignal } from 'solid-js'

export interface Session {
	userId: () => string | null
	logout: () => void
}

export function createLocalSession(): Session {
	return {
		userId: () => null,
		logout: () => {},
	}
}

export function createSupabaseSession(supabase: SupabaseClient): Session {
	const [userId, setUserId] = createSignal<string | null>(null)

	supabase.auth.getSession().then(({ data: { session } }) => {
		setUserId(session?.user.id ?? null)
	})

	supabase.auth.onAuthStateChange((event, session) => {
		if (import.meta.env.DEV) {
			console.log('supabase onAuthStateChange', event, session)
		}
		setUserId(session?.user.id ?? null)
	})

	return { userId: userId, logout: () => supabase.auth.signOut() }
}

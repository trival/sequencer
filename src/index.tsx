import './styles/globals.css'
import { render } from 'solid-js/web'

import App from './App'
import { Router } from '@solidjs/router'
import { AppStateProvider } from './AppState'
import { createSupabaseStorage } from './utils/storage'
import { supabase } from './utils/supabase'
import { createSupabaseSession } from './utils/session'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
	throw new Error(
		'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
	)
}

const storage = createSupabaseStorage(supabase)
const session = createSupabaseSession(supabase)

render(
	() => (
		<Router>
			<AppStateProvider storage={storage} session={session}>
				<App />
			</AppStateProvider>
		</Router>
	),
	root!,
)

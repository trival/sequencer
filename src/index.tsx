import './styles/globals.css'

import { Route, Router, Routes } from '@solidjs/router'
import { render } from 'solid-js/web'
import { AppStateProvider } from './AppState'
import { createSupabaseSession } from './utils/session'
import { createSupabaseStorage } from './utils/storage'
import { supabase } from './utils/supabase'
import { lazy } from 'solid-js'

const root = document.getElementById('root')

const storage = createSupabaseStorage(supabase)
const session = createSupabaseSession(supabase)

render(
	() => (
		<AppStateProvider storage={storage} session={session}>
			<Router>
				<Routes>
					<Route path="/" component={lazy(() => import('@/pages/Home'))} />
					<Route path="/app" component={lazy(() => import('@/pages/App'))} />
					<Route
						path="/tests/colors"
						component={lazy(() => import('@/tests/colors'))}
					/>
					<Route
						path="/tests/melody"
						component={lazy(() => import('@/tests/melody'))}
					/>
					<Route
						path="/tests/player"
						component={lazy(() => import('@/tests/player'))}
					/>
					<Route
						path="/tests/popover"
						component={lazy(() => import('@/tests/popover'))}
					/>
					<Route
						path="/tests/track"
						component={lazy(() => import('@/tests/track'))}
					/>
				</Routes>
			</Router>
		</AppStateProvider>
	),
	root!,
)

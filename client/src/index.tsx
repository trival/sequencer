import '@fontsource/fira-sans/100-italic.css'
import '@fontsource/fira-sans/200-italic.css'
import '@fontsource/fira-sans/300-italic.css'
import '@fontsource/fira-sans/400-italic.css'
import '@fontsource/fira-sans/500-italic.css'
import '@fontsource/fira-sans/600-italic.css'
import '@fontsource/fira-sans/700-italic.css'
import '@fontsource/fira-sans/800-italic.css'
import '@fontsource/fira-sans/900-italic.css'
import '@fontsource/fira-sans/100.css'
import '@fontsource/fira-sans/200.css'
import '@fontsource/fira-sans/300.css'
import '@fontsource/fira-sans/400.css'
import '@fontsource/fira-sans/500.css'
import '@fontsource/fira-sans/600.css'
import '@fontsource/fira-sans/700.css'
import '@fontsource/fira-sans/800.css'
import '@fontsource/fira-sans/900.css'
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

const tests = (
	<>
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
	</>
)

render(
	() => (
		<Router>
			<AppStateProvider storage={storage} session={session}>
				<Routes>
					<Route path="/" component={lazy(() => import('@/pages/Home'))} />
					<Route
						path="/keyboard"
						component={lazy(() => import('@/pages/Keyboard'))}
					/>
					<Route
						path="/songs"
						component={lazy(() => import('@/pages/Songs'))}
					/>
					<Route
						path="/songs/:id"
						component={lazy(() => import('@/pages/Song'))}
					/>
					{tests}
				</Routes>
			</AppStateProvider>
		</Router>
	),
	root!,
)

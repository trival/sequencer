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

import { Route, Router } from '@solidjs/router'
import { render } from 'solid-js/web'
import { AppStateProvider } from './AppState'
import { lazy } from 'solid-js'
import { createLocalSession } from './utils/session'
import { createLocalStorage } from './utils/storage'

const root = document.getElementById('root')
const session = createLocalSession()
const storage = createLocalStorage()

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
			<Route
				path="/"
				component={(props) => (
					<AppStateProvider storage={storage} session={session}>
						{props.children}
					</AppStateProvider>
				)}
			>
				<Route path="/" component={lazy(() => import('@/pages/Home'))} />
				<Route
					path="/keyboard"
					component={lazy(() => import('@/pages/Keyboard'))}
				/>
				<Route path="/songs" component={lazy(() => import('@/pages/Songs'))} />
				<Route
					path="/songs/:id"
					component={lazy(() => import('@/pages/Song'))}
				/>
				{tests}
			</Route>
		</Router>
	),
	root!,
)

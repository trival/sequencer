import { lazy, type Component } from 'solid-js'
import { Route, Routes } from '@solidjs/router'

const App: Component = () => {
	return (
		<Routes>
			<Route path="/" component={lazy(() => import('@/pages/Home'))} />
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
	)
}

export default App

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
		</Routes>
	)
}

export default App

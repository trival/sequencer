import { For } from 'solid-js'
import { useAppState } from '@/AppState'

export default function NavBar() {
	const [state, _actions] = useAppState()
	return (
		<nav>
			<ul>
				<For each={state.openSongs}>{(song) => <li>{song.meta.title}</li>}</For>
			</ul>
		</nav>
	)
}

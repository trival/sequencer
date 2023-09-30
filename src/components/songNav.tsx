import { For } from 'solid-js'
import { useAppState } from '@/AppState'
import { Icon } from 'solid-heroicons'
import { xMark } from 'solid-heroicons/solid'
import { IconButton } from './buttons'
import { bars_3 } from 'solid-heroicons/outline'

export default function NavBar() {
	const [state, actions] = useAppState()
	return (
		<nav class="flex">
			<ul class="flex-grow overflow-x-auto flex">
				<For each={state.openSongs}>
					{(song) => (
						<li class="flex">
							<button
								class="font-semibold underline"
								onClick={() => actions.openSong(song.id)}
							>
								{song.meta.title}
							</button>
							<IconButton onClick={() => actions.closeSong(song.id)}>
								<Icon path={xMark} />
							</IconButton>
						</li>
					)}
				</For>
			</ul>
			<IconButton onClick={() => alert('TODO')}>
				<Icon path={bars_3} class="w-6 h-6" />
			</IconButton>
		</nav>
	)
}

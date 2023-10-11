import { For, Show, createMemo, createSignal } from 'solid-js'
import { useAppState } from '@/AppState'
import { Icon } from 'solid-heroicons'
import { xMark } from 'solid-heroicons/solid'
import { IconButton } from './buttons'
import { bars_3 } from 'solid-heroicons/outline'
import { Overlay } from './Popover'
import SongMetaForm from './songMetaForm'

export default function NavBar() {
	const [state, actions] = useAppState()
	const [openMenu, setOpenMenu] = createSignal(false)
	const openSongs = createMemo(() =>
		state.openSongIds.map((id) => state.songs[id]),
	)
	const currentSong = createMemo(
		() => (state.currentSongId && state.songs[state.currentSongId]) || null,
	)
	return (
		<nav class="flex">
			<ul class="flex flex-grow overflow-x-auto">
				<For each={openSongs()}>
					{(song) => (
						<li class="flex">
							<button
								class="font-semibold underline"
								onClick={() => actions.openSong(song.id)}
							>
								{song.meta.title}
							</button>
							<IconButton onClick={() => actions.closeSong(song.id)}>
								<Icon path={xMark} class="h-6 w-6" />
							</IconButton>
						</li>
					)}
				</For>
			</ul>
			<IconButton onClick={() => setOpenMenu(true)}>
				<Icon path={bars_3} class="h-6 w-6" />
			</IconButton>
			<Overlay visible={openMenu()} onClose={() => setOpenMenu(false)}>
				<Show when={state.currentSongId}>
					<SongMetaForm
						title={currentSong()!.meta.title || ''}
						description={currentSong()!.meta.description || ''}
						onSubmit={(title, description) => {
							if (currentSong()) {
								actions.saveSongMeta(currentSong()!.id, {
									title,
									description,
								})
							}
						}}
					/>
				</Show>
			</Overlay>
		</nav>
	)
}

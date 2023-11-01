import { For, Show, createSignal } from 'solid-js'
import { Icon } from 'solid-heroicons'
import { xMark } from 'solid-heroicons/solid'
import { IconButton } from './buttons'
import { bars_3 } from 'solid-heroicons/outline'
import { Overlay } from './Popover'
import SongMetaForm from './songMetaForm'
import { SongEntity, SongMeta } from '@/datamodel'

export interface SongNavProps {
	openSongs: SongEntity[]
	currentSong?: SongEntity | null
	onOpenSong: (id: string) => void
	onCloseSong: (id: string) => void
	onUpdateSongMeta: (id: string, meta: Partial<SongMeta>) => void
}

export default function NavBar(props: SongNavProps) {
	const [openMenu, setOpenMenu] = createSignal(false)
	return (
		<nav class="flex">
			<ul class="flex flex-grow overflow-x-auto">
				<For each={props.openSongs}>
					{(song) => (
						<li class="flex">
							<button
								class="font-semibold underline"
								onClick={() => props.onOpenSong(song.id)}
							>
								{song.meta.title}
							</button>
							<IconButton onClick={() => props.onCloseSong(song.id)}>
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
				<Show when={props.currentSong}>
					<SongMetaForm
						title={props.currentSong!.meta.title || ''}
						description={props.currentSong!.meta.description || ''}
						onSubmit={(title, description) => {
							if (props.currentSong) {
								props.onUpdateSongMeta(props.currentSong.id, {
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

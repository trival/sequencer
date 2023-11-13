import { Show, createSignal, onCleanup } from 'solid-js'
import { Icon } from 'solid-heroicons'
import { xMark } from 'solid-heroicons/solid'
import { IconButton, IconButtonPopover, LogoutButton } from './buttons'
import { bars_3, pencil } from 'solid-heroicons/outline'
import SongMetaForm from './songMetaForm'
import { SongEntity, SongMeta } from '@/datamodel'
import { A } from '@solidjs/router'
import Logo from './icons/logo'
import { KeyboardSettingsState } from '@/utils/settings'
import { KeyboardSettingsBtn } from './keyboardSettings'
import ProfileSongList from './profileList'
import clsx from 'clsx'

export interface SongNavProps {
	currentSong?: SongEntity | null
	onOpenSong: (id: string) => void
	onCloseSong: (id: string) => void
	onUpdateSongMeta: (id: string, meta: Partial<SongMeta>) => void
	onLogout: () => void
	keyboardState?: KeyboardSettingsState
}

export default function NavBar(props: SongNavProps) {
	const [openMenu, setOpenMenu] = createSignal(false)

	const close = () => setOpenMenu(false)

	document.addEventListener('click', close)
	onCleanup(() => {
		document.removeEventListener('click', close)
	})

	return (
		<nav class="relative z-10 flex items-center px-2 py-1 lg:px-4 lg:py-4">
			<A href="/" class="font-semibold underline">
				<Logo class="mx-3 h-6 w-6" />
			</A>
			<Show when={props.keyboardState}>
				<KeyboardSettingsBtn state={props.keyboardState!} />
			</Show>

			<span class="flex-grow" />

			<Show when={props.currentSong}>
				<h3
					class="ml-4 font-semibold"
					onClick={() => props.onOpenSong(props.currentSong!.id)}
				>
					{props.currentSong!.meta.title}
				</h3>

				<IconButtonPopover
					buttonElement={<Icon path={pencil} class="h-5 w-5" />}
					color="custom"
					class="m-0 ml-2"
				>
					{(close) => (
						<div class="w-64">
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
									close()
								}}
							/>
						</div>
					)}
				</IconButtonPopover>

				<IconButton
					color="custom"
					class="m-0 mr-2"
					onClick={() => props.onCloseSong(props.currentSong!.id)}
				>
					<Icon path={xMark} class="h-6 w-6" />
				</IconButton>
			</Show>

			<span class="flex-grow" />

			<Show
				when={props.currentSong}
				fallback={<LogoutButton onLogout={() => props.onLogout()} />}
			>
				<IconButton
					onClick={(e) => {
						e.stopPropagation()
						e.stopImmediatePropagation()
						setOpenMenu(true)
					}}
					color="custom"
					class="m-0 mr-2"
				>
					<Icon path={bars_3} class="h-6, w-6" />
				</IconButton>

				<nav
					class={clsx(
						'fixed bottom-0 right-0 top-0 z-10 max-w-[80vw] bg-white px-2 py-1 shadow-md transition-transform duration-300',
						openMenu() ? 'translate-x-0' : 'translate-x-full',
					)}
					onClick={(e) => {
						e.stopImmediatePropagation()
						e.stopPropagation()
					}}
				>
					<div class="flex">
						<LogoutButton onLogout={() => props.onLogout()} />
						<span class="flex-grow" />
						<IconButton color="custom" class="m-0 mr-2" onClick={() => close()}>
							<Icon path={xMark} class="h-6 w-6" />
						</IconButton>
					</div>
					<ProfileSongList onSelectSong={() => close()} />
				</nav>
			</Show>
		</nav>
	)
}

import { KeyboardSettings, SongData, SongEntity, SongMeta } from '@/datamodel'
import { A } from '@solidjs/router'
import clsx from 'clsx'
import { Icon } from 'solid-heroicons'
import { bars_3, pencil } from 'solid-heroicons/outline'
import { xMark } from 'solid-heroicons/solid'
import { Show, createSignal, onCleanup } from 'solid-js'
import Logo from './icons/logo'
import { KeyboardSettingsBtn } from './keyboardSettings'
import ProfileSongList from './profileList'
import { IconButton, IconButtonPopover, LogoutButton } from './shared/buttons'
import SongMetaForm from './songMetaForm'
import { SongCodeEditor } from './songCodeEditor'

export interface SongNavProps {
	currentSong?: SongEntity | null
	onUpdateSong?: (song: SongEntity) => void
	onLogout: () => void
}

export default function NavBar(props: SongNavProps) {
	const [openMenu, setOpenMenu] = createSignal(false)

	const close = () => setOpenMenu(false)

	document.addEventListener('click', close)
	onCleanup(() => {
		document.removeEventListener('click', close)
	})

	function updateSongMeta(meta: Partial<SongMeta>) {
		const song = props.currentSong
		if (song && props.onUpdateSong) {
			const updatedSong = {
				...song,
				meta: { ...song.meta, ...meta },
			}
			props.onUpdateSong(updatedSong)
		}
	}

	function updateSongData(songData: SongData) {
		const song = props.currentSong
		if (song && props.onUpdateSong) {
			props.onUpdateSong({ ...song, data: songData })
		}
	}

	function updateKeyboardSettings(settings: Partial<KeyboardSettings>) {
		const song = props.currentSong
		if (song && props.onUpdateSong) {
			props.onUpdateSong({
				...song,
				data: {
					...song.data,
					keyboardSettings: {
						...song.data.keyboardSettings,
						...settings,
					},
				},
			})
		}
	}

	return (
		<nav class="relative z-10 flex items-center px-2 py-1 lg:px-4 lg:py-4">
			<A href="/" class="font-semibold underline">
				<Logo class="mx-3 h-6 w-6" />
			</A>
			<Show when={props.currentSong?.data.keyboardSettings}>
				<KeyboardSettingsBtn
					settings={props.currentSong!.data.keyboardSettings || {}}
					onSettingsUpdate={updateKeyboardSettings}
				/>
			</Show>

			<span class="flex-grow" />

			<Show when={props.currentSong}>
				<h3 class="ml-2 text-right font-semibold">
					{props.currentSong!.meta.title}
				</h3>
				<Show when={props.onUpdateSong}>
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
										updateSongMeta!({
											title,
											description,
										})
										close()
									}}
								/>
							</div>
						)}
					</IconButtonPopover>
				</Show>

				<SongCodeEditor
					song={props.currentSong!.data}
					onUpdateSong={updateSongData}
				/>

				<A color="custom" class="m-0 mr-2" href="/songs">
					<Icon path={xMark} class="h-6 w-6" />
				</A>
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
				>
					<div
						class="flex"
						onClick={(e) => {
							e.stopPropagation()
							e.stopImmediatePropagation()
						}}
					>
						<LogoutButton onLogout={() => props.onLogout()} />
						<span class="flex-grow" />
						<IconButton color="custom" class="m-0 mr-2" onClick={() => close()}>
							<Icon path={xMark} class="h-6 w-6" />
						</IconButton>
					</div>
					<ProfileSongList class="mt-2 p-3" />
				</nav>
			</Show>
		</nav>
	)
}

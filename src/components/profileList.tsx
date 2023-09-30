import { For } from 'solid-js'
import { useAppState } from '@/AppState'
import { Button } from './buttons'
import { Icon } from 'solid-heroicons'
import { documentPlus } from 'solid-heroicons/outline'

export default function ProfileSongList() {
	const [state, actions] = useAppState()
	const songs = () =>
		[...state.songs].sort((a, b) => {
			const res =
				((a.meta.updatedAt && new Date(a.meta.updatedAt).getTime()) || 0) -
				((b.meta.updatedAt && new Date(b.meta.updatedAt).getTime()) || 0)
			if (res !== 0) return res
			if (a.meta.title && b.meta.title) {
				return a.meta.title.localeCompare(b.meta.title)
			}
			return res
		})

	return (
		<div>
			<ul>
				<For each={songs()}>
					{(song) => (
						<li>
							<button
								class="font-semibold underline"
								onClick={() => actions.openSong(song.id)}
							>
								{song.meta.title}
							</button>
						</li>
					)}
				</For>
			</ul>
			<Button class="flex" onClick={() => actions.openNewSong()}>
				<Icon path={documentPlus} class="w-6 h-6 inline-block" />
				New Song
			</Button>
		</div>
	)
}

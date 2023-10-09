import { For } from 'solid-js'
import { useAppState } from '@/AppState'
import { Button } from './buttons'
import { Icon } from 'solid-heroicons'
import { documentPlus } from 'solid-heroicons/outline'
import { format } from 'date-fns'

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
					{(song) => {
						const date = new Date(song.meta.updatedAt!)
						return (
							<li>
								<button
									class="font-semibold underline"
									onClick={() => actions.openSong(song.id)}
								>
									{song.meta.title} ({format(date, 'yyyy-MM-dd')})
								</button>
							</li>
						)
					}}
				</For>
			</ul>
			<Button class="flex" onClick={() => actions.openNewSong()}>
				<Icon path={documentPlus} class="inline-block h-6 w-6" />
				New Song
			</Button>
		</div>
	)
}

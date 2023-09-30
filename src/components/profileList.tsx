import { For } from 'solid-js'
import { useAppState } from '@/AppState'

export default function ProfileSongList() {
	const [state, _actions] = useAppState()
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
				<For each={songs()}>{(song) => <li>{song.meta.title}</li>}</For>
			</ul>
		</div>
	)
}

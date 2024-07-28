import { For, Show } from 'solid-js'
import { useAppState } from '@/AppState'
import { Button } from './shared/buttons'
import { Icon } from 'solid-heroicons'
import { documentPlus } from 'solid-heroicons/outline'
import { format } from 'date-fns'
import { A } from '@solidjs/router'

interface Props {
	class?: string
}

export default function ProfileSongList(props: Props) {
	const [state, actions] = useAppState()
	const songs = () =>
		Object.values(state.songs).sort((a, b) => {
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
		<div class={props.class}>
			<ul>
				<For each={songs()}>
					{(song) => {
						const date = song.meta.updatedAt && new Date(song.meta.updatedAt)
						return (
							<li class="mb-2">
								<A
									href={`/songs/${song.id}`}
									activeClass="text-indigo-600"
									class="font-semibold underline"
								>
									{song.meta.title} ({date ? format(date, 'yyyy-MM-dd') : 'new'}
									)
									<Show when={song.meta.description}>
										<span class="ml-2 block text-sm text-gray-500">
											{song.meta.description}
										</span>
									</Show>
								</A>
							</li>
						)
					}}
				</For>
			</ul>
			<Button
				color="indigo"
				class="mt-8 flex items-center"
				onClick={() => actions.openNewSong()}
			>
				<Icon path={documentPlus} class="mr-3 inline-block h-6 w-6" />
				New Song
			</Button>
		</div>
	)
}

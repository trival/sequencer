import { SongData, songDataSchema } from '@/datamodel'
import { Icon } from 'solid-heroicons'
import { codeBracket } from 'solid-heroicons/outline'
import { createEffect, createSignal } from 'solid-js'
import { Button, IconButton } from './shared/buttons'
import { Overlay } from './shared/popover'

export interface SongCodeEditorProps {
	song: SongData
	onUpdateSong: (song: SongData) => void
}

export const SongCodeEditor = (props: SongCodeEditorProps) => {
	const [isDataOverlayOpen, setDataOverlayOpen] = createSignal(false)
	const [initialData, setInitialData] = createSignal('')
	const [editedData, setEditedData] = createSignal('')

	const isInitial = () => initialData() === editedData()

	createEffect(() => {
		const text = JSON.stringify(props.song, null, '  ')
		if (text !== initialData()) {
			setInitialData(text)
			setEditedData(text)
		}
	})

	return (
		<>
			<IconButton
				color="custom"
				onClick={() => setDataOverlayOpen(true)}
				class="mx-3"
				title="Edit song data as code"
			>
				<Icon path={codeBracket} class="h-6 w-6" />
			</IconButton>
			<Overlay
				onClose={() => setDataOverlayOpen(false)}
				visible={isDataOverlayOpen()}
				class="m-5 max-h-[90vh] w-full max-w-[800px] overflow-y-auto rounded-lg bg-slate-100 p-6 shadow-lg"
			>
				<textarea
					class="block w-full select-text font-mono text-sm"
					rows={20}
					onInput={(e) => {
						setEditedData(e.target.value)
					}}
					value={editedData()}
				>
					{JSON.stringify(props.song, null, '  ')}
				</textarea>

				<div class="mt-6 flex justify-end gap-6">
					<Button color="white" onClick={() => setDataOverlayOpen(false)}>
						Cancel
					</Button>
					<Button
						color="white"
						onClick={() => setEditedData(initialData())}
						disabled={isInitial()}
					>
						Reset
					</Button>
					<Button
						color="indigo"
						onClick={() => {
							try {
								const parsedSong = songDataSchema.parse(
									JSON.parse(editedData()),
								)
								props.onUpdateSong(parsedSong)
							} catch (e) {
								console.error(e)
							}
						}}
						disabled={isInitial()}
					>
						Update Song
					</Button>
				</div>
			</Overlay>
		</>
	)
}

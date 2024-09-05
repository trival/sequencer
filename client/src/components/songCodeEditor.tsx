import { SongData, songDataSchema } from '@/datamodel'
import { Icon } from 'solid-heroicons'
import { codeBracket } from 'solid-heroicons/outline'
import { createEffect, createSignal } from 'solid-js'
import { Button } from './shared/buttons'
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
			<Button
				onClick={() => setDataOverlayOpen(true)}
				class="my-auto ml-8 rounded pb-1 pl-1 pr-1 pt-1"
				title="Export"
			>
				<Icon path={codeBracket} class="h-6 w-6" />
			</Button>
			<Overlay
				onClose={() => setDataOverlayOpen(false)}
				visible={isDataOverlayOpen()}
				class="m-10 max-h-[90vh] overflow-y-auto rounded-lg bg-slate-100 p-10 shadow-lg"
			>
				<textarea
					class="mono select-text text-xs"
					onChange={(e) => {
						setEditedData(e.target.value)
					}}
				>
					{JSON.stringify(props.song, null, '  ')}
				</textarea>
				<Button
					onClick={() => {
						try {
							const parsedSong = songDataSchema.parse(JSON.parse(editedData()))
							props.onUpdateSong(parsedSong)
						} catch (e) {
							console.error(e)
						}
					}}
					disabled={isInitial()}
				>
					Update Song
				</Button>
			</Overlay>
		</>
	)
}

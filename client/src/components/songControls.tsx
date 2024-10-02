import {
	SongData,
	SongEntity,
	SongProperties,
	Subdivision,
	subdivisionValues,
} from '@/datamodel'
import { truthy } from '@/utils/utils'
import { Icon } from 'solid-heroicons'
import { cloudArrowUp, minus, plus } from 'solid-heroicons/outline'
import { stop } from 'solid-heroicons/solid'
import { For, Show, createMemo, createSignal, mergeProps } from 'solid-js'
import * as Tone from 'tone'
import {
	AddButton,
	Button,
	DeleteButton,
	EditButton,
	IconButton,
	PlayButton,
} from './shared/buttons'
import { Input, Select } from './shared/input'
import Popover from './shared/popover'
import { SongCodeEditor } from './songCodeEditor'

const durationOptions = subdivisionValues.map((s) => ({
	value: s,
	label: s,
}))

interface SongControlsProps {
	songEntity: SongEntity
	onSongDataChanged?: (songData: SongData) => void
	isPlaying?: boolean
	activeNoteIds?: [number, number][]
	defaultDuration: Subdivision
	onAddAfter?: (trackIdx: number, noteIdx: number) => void
	onAddBefore?: (trackIdx: number, noteIdx: number) => void
	onRemove?: (trackIdx: number, noteIdx: number) => void
	onDurationChanged?: (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => void
	onPropsChanged?: (props: Partial<SongProperties>) => void
	onPlay?: () => void
	onStop?: () => void
	onSave?: () => void
}

export function SongControls(props: SongControlsProps) {
	const singleActiveIdx = () => {
		const ids = props.activeNoteIds
		if (ids?.length !== 1) return null
		return ids[0]
	}

	const [isDurationEditorOpen, setDurationEditorOpen] = createSignal(false)
	let editBtnRef: HTMLButtonElement | undefined

	const songData = createMemo(() => props.songEntity.data)

	const activeNote = () => {
		const idx = singleActiveIdx()
		return idx ? songData().song.tracks[idx[0]]?.notes[idx[1]] : null
	}

	const activeDuration = () => {
		const note = activeNote()
		return note
			? Array.isArray(note.duration)
				? note.duration
				: [note.duration]
			: [props.defaultDuration]
	}

	return (
		<div class="relative flex w-full items-center pb-2">
			{props.onPlay && (
				<PlayButton isPlaying={props.isPlaying} onClick={props.onPlay} />
			)}
			{props.onStop && (
				<Button
					onClick={() => props.onStop?.()}
					class="my-auto mr-2 rounded pb-2 pl-2 pr-2 pt-2"
				>
					<Icon path={stop} class="h-6 w-6" />
				</Button>
			)}

			{singleActiveIdx() && !props.isPlaying ? (
				<div class="relative flex w-fit">
					{props.onAddBefore && (
						<AddButton
							onClick={() => {
								props.onAddBefore!(singleActiveIdx()![0], singleActiveIdx()![1])
								setTimeout(() => setDurationEditorOpen(true), 100)
							}}
						/>
					)}
					{props.onDurationChanged && activeNote() && (
						<div class="relative inline-block">
							<EditButton
								ref={editBtnRef}
								onClick={() => setDurationEditorOpen(!isDurationEditorOpen())}
							/>
							<Popover
								referenceElement={editBtnRef as HTMLButtonElement}
								onClose={() => setDurationEditorOpen(false)}
								visible={isDurationEditorOpen()}
								class="absolute z-10 my-2 rounded bg-gray-100/90 p-2 shadow-md"
								popperOptions={{
									placement: 'bottom-start',
									modifiers: [{ name: 'offset', options: { offset: [0, 10] } }],
								}}
							>
								<DurationSelector
									value={activeDuration()}
									defaultDuration={props.defaultDuration}
									onChange={(durations) => {
										props.onDurationChanged?.(
											singleActiveIdx()![0],
											singleActiveIdx()![1],
											durations,
										)
									}}
								/>
							</Popover>
						</div>
					)}
					{props.onRemove && (
						<DeleteButton
							onClick={() => {
								props.onRemove!(singleActiveIdx()![0], singleActiveIdx()![1])
								setDurationEditorOpen(false)
							}}
						/>
					)}
					{props.onAddAfter && (
						<AddButton
							onClick={() => {
								props.onAddAfter!(singleActiveIdx()![0], singleActiveIdx()![1])
								setTimeout(() => setDurationEditorOpen(true), 100)
							}}
						/>
					)}
				</div>
			) : (
				<div class="flex w-fit">
					{props.onPropsChanged && (
						<label class="mx-2 my-auto">
							Bpm:{' '}
							<Input
								class="w-20"
								type="number"
								value={songData().song.bpm}
								onChange={(val) => {
									const bpm = parseInt(val as string)
									Tone.getTransport().bpm.value = bpm
									props.onPropsChanged!({ bpm })
								}}
							/>
						</label>
					)}

					{props.onSongDataChanged && (
						<SongCodeEditor
							onUpdateSong={props.onSongDataChanged}
							song={songData()}
							title={[
								props.songEntity.id,
								props.songEntity.meta.title,
								props.songEntity.meta.collection,
							]
								.filter(truthy)
								.join('_')}
						/>
					)}

					{props.onSave && (
						<Button
							onClick={() => props.onSave?.()}
							class="mx-2 my-auto rounded border border-indigo-500 pb-2 pl-2 pr-2 pt-2"
							title="Save"
							color="indigo"
						>
							<Icon path={cloudArrowUp} class="h-6 w-6" />
						</Button>
					)}
				</div>
			)}
		</div>
	)
}

interface DurationSelectorProps {
	defaultDuration: Subdivision
	value: Subdivision[]
	onChange: (duration: Subdivision[]) => void
	onClose?: () => void
}
function DurationSelector(_props: DurationSelectorProps) {
	const props = mergeProps({ value: [] }, _props)

	return (
		<div class="flex flex-col gap-2">
			<For each={props.value}>
				{(dur, i) => (
					<span class="flex items-center justify-start">
						<Select
							class="mr-3 w-20"
							value={dur}
							onSelect={(duration) => {
								const durs = [...props.value]
								durs[i()] = duration as Subdivision
								props.onChange(durs)
							}}
							options={durationOptions}
						/>
						<Show
							when={i() > 0}
							fallback={
								<IconButton
									onClick={() =>
										props.onChange([props.defaultDuration, ...props.value])
									}
								>
									<Icon path={plus} class="h-6 w-6" aria-hidden="true" />
								</IconButton>
							}
						>
							<IconButton
								onClick={(e) => {
									e.stopPropagation()
									props.onChange(props.value.filter((_, j) => j !== i()))
								}}
							>
								<Icon path={minus} class="h-6 w-6" aria-hidden="true" />
							</IconButton>
						</Show>
					</span>
				)}
			</For>
		</div>
	)
}

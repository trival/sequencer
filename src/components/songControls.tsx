import { Subdivision } from 'tone/build/esm/core/type/Units'
import {
	AddButton,
	Button,
	DeleteButton,
	EditButton,
	IconButton,
	PlayButton,
} from '@/components/buttons'
import { Input, Select } from './Input'
import { subdivisions } from '@/utils/utils'
import {
	plus,
	minus,
	archiveBoxArrowDown,
	arrowUpOnSquare,
} from 'solid-heroicons/outline'
import { stop } from 'solid-heroicons/solid'
import { For, Show, createEffect, createSignal, mergeProps } from 'solid-js'
import { Icon } from 'solid-heroicons'
import { SongData, SongProperties } from '@/datamodel'
import { Overlay } from './Popover'

const durationOptions = subdivisions.map((s) => ({
	value: s,
	label: s,
}))

interface SongControlsProps {
	song: SongData
	isPlaying?: boolean
	activeNoteIdx?: [number, number] | null
	defaultDuration?: Subdivision
	onAddAfter?: (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => void
	onAddBefore?: (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => void
	onRemove?: (trackIdx: number, noteIdx: number) => void
	onDurationChanged?: (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => void
	onPlay?: () => void
	onStop?: () => void
	onPropsChanged?: (props: Partial<SongProperties>) => void
	onSave?: () => void
}

export function SongControls(_props: SongControlsProps) {
	const props = mergeProps({ defaultDuration: '4n' as Subdivision }, _props)

	const [isDataOverlayOpen, setDataOverlayOpen] = createSignal(false)

	const activeNote = () =>
		props.activeNoteIdx
			? props.song.tracks[props.activeNoteIdx[0]]?.[props.activeNoteIdx[1]]
			: null

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

			{props.activeNoteIdx && !props.isPlaying ? (
				<div class="relative flex w-fit">
					{props.onAddBefore && (
						<AddButton>
							{(close) => (
								<DurationSelector
									defaultDuration={props.defaultDuration}
									onSelect={(durations) => {
										close()
										props.onAddBefore?.(
											props.activeNoteIdx![0],
											props.activeNoteIdx![1],
											durations,
										)
									}}
								/>
							)}
						</AddButton>
					)}
					{props.onDurationChanged && activeNote() && (
						<EditButton>
							{(close) => (
								<DurationSelector
									value={activeDuration()}
									defaultDuration={props.defaultDuration}
									onSelect={(durations) => {
										close()
										props.onDurationChanged!(
											props.activeNoteIdx![0],
											props.activeNoteIdx![1],
											durations,
										)
									}}
								/>
							)}
						</EditButton>
					)}
					{props.onRemove && (
						<DeleteButton
							onConfirm={() =>
								props.onRemove!(
									props.activeNoteIdx![0],
									props.activeNoteIdx![1],
								)
							}
						/>
					)}
					{props.onAddAfter && (
						<AddButton>
							{(close) => (
								<DurationSelector
									defaultDuration={props.defaultDuration}
									onSelect={(durations) => {
										close()
										props.onAddAfter!(
											props.activeNoteIdx![0],
											props.activeNoteIdx![1],
											durations,
										)
									}}
								/>
							)}
						</AddButton>
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
								value={props.song.bpm}
								onChange={(val) => {
									props.onStop && props.onStop()
									props.onPropsChanged!({ bpm: parseInt(val as string) })
								}}
							/>
						</label>
					)}

					<Button
						onClick={() => setDataOverlayOpen(true)}
						class="my-auto ml-8 rounded pb-1 pl-1 pr-1 pt-1"
						title="Export"
					>
						<Icon path={archiveBoxArrowDown} class="h-6 w-6" />
					</Button>
					<Overlay
						onClose={() => setDataOverlayOpen(false)}
						visible={isDataOverlayOpen()}
						class="m-10 max-h-[90vh] overflow-y-auto rounded-lg bg-slate-100 p-10 shadow-lg"
					>
						<pre>
							<code class="mono text-xs">
								{JSON.stringify(props.song, null, '  ')}
							</code>
						</pre>
					</Overlay>
					{props.onSave && (
						<Button
							onClick={() => props.onSave?.()}
							class="mx-2 my-auto rounded border border-indigo-500 pb-1 pl-1 pr-1 pt-1"
							title="Save"
							color="indigo"
						>
							<Icon path={arrowUpOnSquare} class="h-6 w-6" />
						</Button>
					)}
				</div>
			)}
		</div>
	)
}

interface DurationSelectorProps {
	defaultDuration: Subdivision
	onSelect: (duration: Subdivision[]) => void
	value?: Subdivision[]
}

function DurationSelector(_props: DurationSelectorProps) {
	const props = mergeProps({ value: [] }, _props)

	const [durations, setDurations] = createSignal<Subdivision[]>([
		props.defaultDuration,
	])

	createEffect(() => {
		if (props.value.length) {
			setDurations(props.value)
		}
	})

	return (
		<div>
			<For each={durations()}>
				{(dur, i) => (
					<span class="mb-2 flex items-center justify-start">
						<Select
							class="mr-3 w-20"
							value={dur}
							onSelect={(duration) => {
								setDurations((durs) => {
									durs[i()] = duration as Subdivision
									return durs
								})
							}}
							options={durationOptions}
						/>
						<Show when={i() > 0}>
							<IconButton
								onClick={() =>
									setDurations((ds) => ds.filter((_, j) => j !== i()))
								}
							>
								<Icon path={minus} class="h-6 w-6" aria-hidden="true" />
							</IconButton>
						</Show>
					</span>
				)}
			</For>
			<span class="mt-3 flex items-center justify-center">
				<Button
					color="teal"
					class="mr-3 w-20"
					onClick={() => {
						props.onSelect(
							durations().length ? durations() : [props.defaultDuration],
						)
					}}
				>
					Ok
				</Button>
				<IconButton
					onClick={() => setDurations((ds) => [...ds, props.defaultDuration])}
				>
					<Icon path={plus} class="h-6 w-6" aria-hidden="true" />
				</IconButton>
			</span>
		</div>
	)
}

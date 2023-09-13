import { ProcessedTrack, toDurations } from '@/utils/song'
import clsx from 'clsx'
import { Subdivision } from 'tone/build/esm/core/type/Units'
import {
	AddButton,
	Button,
	DeleteButton,
	EditButton,
	IconButton,
	PlayButton,
} from '@/components/buttons'
import { Input, Select } from './Select'
import { subdivisions } from '@/utils/utils'
import { plus, minus, stop } from 'solid-heroicons/solid'
import { For, Show, createEffect, createSignal, mergeProps } from 'solid-js'
import { Icon } from 'solid-heroicons'

const secondWidthFactor = 60

interface NoteProps {
	durationSec: number
	isActive?: boolean
	isEmpty?: boolean
	onSelected?: () => void
}

const durationOptions = subdivisions.map((s) => ({
	value: s,
	label: s,
}))

export const Note = (props: NoteProps) => {
	return (
		<div
			style={{
				width: props.durationSec * secondWidthFactor + 'px',
				'min-width': props.durationSec * secondWidthFactor + 'px',
			}}
			class={clsx('relative h-8 px-[2px]')}
		>
			<button
				class={clsx(
					'h-full w-full',
					props.isActive
						? 'bg-cyan-300'
						: props.isEmpty
						? 'bg-slate-200'
						: 'bg-slate-300',
				)}
				onClick={() => props.onSelected()}
			/>
		</div>
	)
}

interface TrackProps {
	song: ProcessedTrack[]
	bpm: number
	isPlaying?: boolean
	activeNoteIdx?: [number, number] | null
	onNoteClicked?: (trackIdx: number, noteIdx: number) => void
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
	defaultDuration?: Subdivision
	onPlay?: () => void
	onStop?: () => void
	onTempoChanged?: (tempo: number) => void
}

export const Track = (_props: TrackProps) => {
	const props = mergeProps({ defaultDuration: '4n' }, _props)
	const trackCountMeasures = () =>
		props.song.map((track) =>
			track.measureSec
				? Math.floor(track.durationSec / track.measureSec) + 1
				: 0,
		)
	const countMeasures = () =>
		trackCountMeasures().reduce((a, b) => Math.max(a, b), 0)
	const measureSec = () => props.song[0]?.measureSec ?? 0

	const activeNote = () =>
		props.activeNoteIdx
			? props.song[props.activeNoteIdx[0]]?.notes[props.activeNoteIdx[1]]
			: null

	return (
		<div class="relative w-full">
			<div class="relative w-full overflow-x-auto pb-2">
				<div class="relative w-fit px-2">
					<div class="absolute h-full">
						<For each={[...Array(countMeasures())].map((_, i) => i)}>
							{(i) => (
								<span
									class="absolute h-full w-[1px] bg-cyan-300"
									style={{ left: measureSec() * i * secondWidthFactor + 'px' }}
								/>
							)}
						</For>
					</div>
					<For each={props.song}>
						{(track, i) => (
							<div class="flex h-12 items-center">
								<For each={track.notes}>
									{(note, j) => (
										<Note
											durationSec={note.durationSec}
											isActive={props.activeNoteIdx?.[1] === j()}
											isEmpty={note.midiNotes.length === 0}
											onSelected={
												props.onNoteClicked &&
												(() => props.onNoteClicked(i(), j()))
											}
										/>
									)}
								</For>
							</div>
						)}
					</For>
				</div>
			</div>
			<div class="relative flex w-full pb-2 items-center">
				{props.onPlay && (
					<PlayButton isPlaying={props.isPlaying} onClick={props.onPlay} />
				)}
				{props.onStop && (
					<Button
						onClick={() => props.onStop()}
						class="px-2 pt-2 pb-2 pl-2 pr-2 my-2 mr-2 rounded"
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
											props.onAddBefore(
												props.activeNoteIdx[0],
												props.activeNoteIdx[1],
												durations,
											)
										}}
									/>
								)}
							</AddButton>
						)}
						{props.onDurationChanged && activeNote && (
							<EditButton>
								{(close) => (
									<DurationSelector
										value={toDurations(activeNote().duration)}
										defaultDuration={props.defaultDuration}
										onSelect={(durations) => {
											close()
											props.onDurationChanged(
												props.activeNoteIdx[0],
												props.activeNoteIdx[1],
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
									props.onRemove(props.activeNoteIdx[0], props.activeNoteIdx[1])
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
											props.onAddAfter(
												props.activeNoteIdx[0],
												props.activeNoteIdx[1],
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
						{props.onTempoChanged && (
							<label class="ml-2">
								Bpm:{' '}
								<Input
									class="w-20"
									type="number"
									value={props.bpm}
									onChange={(val) => {
										props.onStop && props.onStop()
										props.onTempoChanged(parseInt(val as string))
									}}
								/>
							</label>
						)}
					</div>
				)}
			</div>
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

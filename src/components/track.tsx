import { ProcessedTrack, toDurations } from '@/utils/melody'
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
import { Select } from './Select'
import { subdivisions } from '@/utils/utils'
import { useImmer } from 'use-immer'
import { PlusIcon, MinusIcon } from '@heroicons/react/20/solid'

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

export const Note = ({
	durationSec,
	isActive,
	isEmpty,
	onSelected,
}: NoteProps) => {
	return (
		<div
			style={{
				width: durationSec * secondWidthFactor + 'px',
				minWidth: durationSec * secondWidthFactor + 'px',
			}}
			className={clsx('relative h-8 px-[2px]')}
		>
			<button
				className={clsx(
					'h-full w-full',
					isActive ? 'bg-cyan-300' : isEmpty ? 'bg-slate-200' : 'bg-slate-300',
				)}
				onClick={onSelected}
			></button>
		</div>
	)
}

interface TrackProps {
	song: ProcessedTrack[]
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
}

export const Track = ({
	song,
	isPlaying,
	activeNoteIdx,
	onNoteClicked,
	onRemove,
	onAddBefore,
	onAddAfter,
	onDurationChanged,
	defaultDuration = '4n',
	onPlay,
}: TrackProps) => {
	const trackCountMeasures = song.map((track) =>
		track.measureSec ? Math.floor(track.durationSec / track.measureSec) + 1 : 0,
	)
	const countMeasures = trackCountMeasures.reduce((a, b) => Math.max(a, b), 0)
	let measureSec = song[0]?.measureSec ?? 0

	const activeNote = activeNoteIdx
		? song[activeNoteIdx[0]]?.notes[activeNoteIdx[1]]
		: null

	return (
		<div className="relative w-full">
			<div className="relative w-full overflow-x-auto pb-2">
				<div className="relative w-fit px-2">
					<div className="absolute h-full">
						{[...Array(countMeasures)].map((_, i) => (
							<span
								key={i}
								className="absolute h-full w-[1px] bg-cyan-300"
								style={{ left: measureSec * i * secondWidthFactor }}
							></span>
						))}
					</div>
					{song.map((track, i) => (
						<div className="flex h-12 items-center" key={i}>
							{track.notes.map((note, j) => {
								return (
									<Note
										key={j}
										durationSec={note.durationSec}
										isActive={activeNoteIdx?.[1] === j}
										isEmpty={note.midiNotes.length === 0}
										onSelected={onNoteClicked && (() => onNoteClicked(i, j))}
									></Note>
								)
							})}
						</div>
					))}
				</div>
			</div>
			<div className="relative flex w-full pb-2">
				{onPlay && <PlayButton isPlaying={isPlaying} onClick={onPlay} />}
				{activeNoteIdx && !isPlaying && (
					<div className="relative flex w-fit">
						{onAddBefore && (
							<AddButton>
								{({ close }) => (
									<DurationSelector
										defaultDuration={defaultDuration}
										onSelect={(durations) => {
											close()
											onAddBefore(activeNoteIdx[0], activeNoteIdx[1], durations)
										}}
									/>
								)}
							</AddButton>
						)}
						{onDurationChanged && activeNote && (
							<EditButton>
								{({ close }) => (
									<DurationSelector
										value={toDurations(activeNote.duration)}
										defaultDuration={defaultDuration}
										onSelect={(durations) => {
											close()
											onDurationChanged(
												activeNoteIdx[0],
												activeNoteIdx[1],
												durations,
											)
										}}
									/>
								)}
							</EditButton>
						)}
						{onRemove && (
							<DeleteButton
								onConfirm={() => onRemove(activeNoteIdx[0], activeNoteIdx[1])}
							/>
						)}
						{onAddAfter && (
							<AddButton>
								{({ close }) => (
									<DurationSelector
										defaultDuration={defaultDuration}
										onSelect={(durations) => {
											close()
											onAddAfter(activeNoteIdx[0], activeNoteIdx[1], durations)
										}}
									/>
								)}
							</AddButton>
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

function DurationSelector({
	defaultDuration,
	onSelect,
	value = [],
}: DurationSelectorProps) {
	const initialDurations = value.length ? value : [defaultDuration]
	const [durations, updateDuration] = useImmer(initialDurations)

	return (
		<div>
			{durations.map((dur, i) => {
				return (
					<span key={i} className="mb-2 flex items-center justify-start">
						<Select
							className="mr-3 w-20"
							value={dur}
							onSelect={(duration) => {
								updateDuration((durs) => {
									durs[i] = duration as Subdivision
								})
							}}
							options={durationOptions}
						/>
						{i > 0 && (
							<IconButton
								onClick={() =>
									updateDuration((ds) => ds.filter((_, j) => j !== i))
								}
							>
								<MinusIcon className="h-6 w-6" aria-hidden="true" />
							</IconButton>
						)}
					</span>
				)
			})}
			<span className="mt-3 flex items-center justify-center">
				<Button
					color="teal"
					className="mr-3 w-20"
					onClick={() => {
						onSelect(durations.length ? durations : [defaultDuration])
					}}
				>
					Ok
				</Button>
				<IconButton
					onClick={() =>
						updateDuration((ds) => {
							ds.push(defaultDuration)
						})
					}
				>
					<PlusIcon className="h-6 w-6" aria-hidden="true" />
				</IconButton>
			</span>
		</div>
	)
}

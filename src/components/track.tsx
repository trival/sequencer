import { ProcessedMelody, toDurations } from '@/utils/melody'
import clsx from 'clsx'
import { Subdivision } from 'tone/build/esm/core/type/Units'
import {
	AddButton,
	Button,
	DeleteButton,
	EditButton,
	IconButton,
} from '@/components/buttons'
import { Select } from './Select'
import { subdivisions } from '@/utils/utils'
import { useImmer } from 'use-immer'
import { PlusIcon } from '@heroicons/react/20/solid'
import { MinusIcon } from '@heroicons/react/20/solid'

const secondWidthFactor = 60

interface NoteProps {
	durationSec: number
	isActive?: boolean
	onSelected?: () => void
}

const durationOptions = subdivisions.map((s) => ({
	value: s,
	label: s,
}))

export const Note = ({ durationSec, isActive, onSelected }: NoteProps) => {
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
					isActive ? 'bg-cyan-300' : 'bg-slate-300',
				)}
				onClick={onSelected}
			></button>
		</div>
	)
}

interface TrackProps {
	melody: ProcessedMelody
	activeNoteIdx?: number | null
	onNoteClicked?: (idx: number) => void
	onAddAfter?: (idx: number, duration: Subdivision | Subdivision[]) => void
	onAddBefore?: (idx: number, duration: Subdivision | Subdivision[]) => void
	onRemove?: (idx: number) => void
	onDurationChanged?: (
		idx: number,
		duration: Subdivision | Subdivision[],
	) => void
	defaultDuration?: Subdivision
}

export const Track = ({
	melody,
	activeNoteIdx,
	onNoteClicked,
	onRemove,
	onAddBefore,
	onAddAfter,
	onDurationChanged,
	defaultDuration = '4n',
}: TrackProps) => {
	const countMeasures = melody.measureSec
		? Math.floor(melody.durationSec / melody.measureSec) + 1
		: 0

	const activeNote = activeNoteIdx != null ? melody.notes[activeNoteIdx] : null

	return (
		<div className="relative w-full">
			<div className="relative w-full overflow-x-auto pb-2">
				<div className="relative w-fit px-2">
					<div className="absolute h-full">
						{[...Array(countMeasures)].map((_, i) => (
							<span
								key={i}
								className="absolute h-full w-[1px] bg-cyan-300"
								style={{ left: melody.measureSec * i * secondWidthFactor }}
							></span>
						))}
					</div>
					<div className="flex h-12 items-center">
						{melody.notes.map((note, i) => {
							return (
								<Note
									key={i}
									durationSec={note.durationSec}
									isActive={activeNoteIdx === i}
									onSelected={onNoteClicked && (() => onNoteClicked(i))}
								></Note>
							)
						})}
					</div>
				</div>
			</div>
			<div className="relative w-full pb-2">
				<div className="relative flex w-fit">
					{onAddBefore && activeNoteIdx != null && (
						<AddButton>
							{({ close }) => (
								<DurationSelector
									defaultDuration={defaultDuration}
									onSelect={(durations) => {
										close()
										onAddBefore(activeNoteIdx, durations)
									}}
								/>
							)}
						</AddButton>
					)}
					{onDurationChanged && activeNoteIdx != null && activeNote && (
						<EditButton>
							{({ close }) => (
								<DurationSelector
									value={toDurations(activeNote.duration)}
									defaultDuration={defaultDuration}
									onSelect={(durations) => {
										close()
										onDurationChanged(activeNoteIdx, durations)
									}}
								/>
							)}
						</EditButton>
					)}
					{onRemove && activeNoteIdx != null && (
						<DeleteButton onConfirm={() => onRemove(activeNoteIdx)} />
					)}
					{onAddAfter && activeNoteIdx != null && (
						<AddButton>
							{({ close }) => (
								<DurationSelector
									defaultDuration={defaultDuration}
									onSelect={(durations) => {
										close()
										onAddAfter(activeNoteIdx, durations)
									}}
								/>
							)}
						</AddButton>
					)}
				</div>
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

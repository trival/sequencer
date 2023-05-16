import { ProcessedMelody, toDurations } from '@/utils/melody'
import clsx from 'clsx'
import { Subdivision, TimeObject } from 'tone/build/esm/core/type/Units'
import { Popover } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import {
	AddButton,
	Button,
	DeleteButton,
	EditButton,
	IconButton,
} from '@/components/buttons'
import Select from './Select'
import { subdivisions } from '@/utils/utils'
import { useImmer } from 'use-immer'
import { PlusIcon } from '@heroicons/react/20/solid'
import { MinusIcon } from '@heroicons/react/20/solid'

const secondWidthFactor = 60

interface NoteProps {
	durationSec: number
	duration: TimeObject
	isActive?: boolean
	onSelected?: () => void
	onRemove?: () => void
	onAddAfter?: (duration: Subdivision | Subdivision[]) => void
	onAddBefore?: (duration: Subdivision | Subdivision[]) => void
	onDurationChanged?: (duration: Subdivision | Subdivision[]) => void
	defaultDuration?: Subdivision
}

const durationOptions = subdivisions.map((s) => ({
	id: s,
	label: s,
}))

export const Note = ({
	durationSec,
	duration,
	isActive,
	onSelected,
	onRemove,
	onAddAfter,
	onAddBefore,
	onDurationChanged,
	defaultDuration = '4n',
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
					isActive ? 'bg-cyan-300' : 'bg-slate-300',
				)}
				onClick={onSelected}
			></button>

			{isActive && (
				<Popover className="relative">
					<Popover.Button className="flex w-full min-w-fit justify-center">
						<EllipsisHorizontalIcon className="h-8 w-8" />
					</Popover.Button>

					<Popover.Panel className="absolute top-0 z-10 flex -translate-y-full rounded bg-gray-100/70 shadow-md">
						{({ close: closeNote }) => (
							<>
								{onAddBefore && (
									<AddButton>
										<DurationSelector
											defaultDuration={defaultDuration}
											onSelect={(durations) => {
												closeNote()
												onAddBefore(durations)
											}}
										/>
									</AddButton>
								)}
								{onDurationChanged && (
									<EditButton>
										<DurationSelector
											value={toDurations(duration)}
											defaultDuration={defaultDuration}
											onSelect={(durations) => {
												closeNote()
												onDurationChanged(durations)
											}}
										/>
									</EditButton>
								)}
								{onRemove && <DeleteButton onConfirm={onRemove} />}
								{onAddAfter && (
									<AddButton>
										<DurationSelector
											defaultDuration={defaultDuration}
											onSelect={(durations) => {
												closeNote()
												onAddAfter(durations)
											}}
										/>
									</AddButton>
								)}
							</>
						)}
					</Popover.Panel>
				</Popover>
			)}
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
}

export const Track = ({
	melody,
	activeNoteIdx,
	onNoteClicked,
	onRemove,
	onAddBefore,
	onAddAfter,
	onDurationChanged,
}: TrackProps) => {
	const countMeasures = melody.measureSec
		? Math.floor(melody.durationSec / melody.measureSec) + 1
		: 0

	return (
		<div className="relative min-w-fit px-2">
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
							duration={note.duration}
							durationSec={note.durationSec}
							isActive={activeNoteIdx === i}
							onSelected={onNoteClicked && (() => onNoteClicked(i))}
							onRemove={onRemove && (() => onRemove(i))}
							onAddBefore={onAddBefore && ((dur) => onAddBefore(i, dur))}
							onAddAfter={onAddAfter && ((dur) => onAddAfter(i, dur))}
							onDurationChanged={
								onDurationChanged && ((dur) => onDurationChanged(i, dur))
							}
						></Note>
					)
				})}
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
	defaultDuration: preSelectedAddDuration,
	onSelect,
	value = [],
}: DurationSelectorProps) {
	const initialDurations = value.length ? value : [preSelectedAddDuration]
	const [durations, updateDuration] = useImmer(initialDurations)

	return (
		<div>
			{durations.map((dur, i) => {
				return (
					<span key={i} className="mb-2 flex items-center justify-center">
						<Select
							className="mr-3 w-20"
							selectedOptionId={dur}
							onSelect={(duration) => {
								updateDuration((durs) => {
									durs[i] = duration as Subdivision
								})
							}}
							options={durationOptions}
						/>
						{i > 0 && (
							<IconButton>
								<MinusIcon className="h-6 w-6" aria-hidden="true" />
							</IconButton>
						)}
					</span>
				)
			})}
			<span className="mt-3 flex items-center justify-center">
				<Button
					onClick={() => {
						onSelect(durations.length ? durations : [preSelectedAddDuration])
					}}
				>
					Ok
				</Button>
				<IconButton>
					<PlusIcon className="h-6 w-6" aria-hidden="true" />
				</IconButton>
			</span>
		</div>
	)
}

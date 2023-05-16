import { ProcessedMelody } from '@/utils/melody'
import clsx from 'clsx'
import { Subdivision } from 'tone/build/esm/core/type/Units'
import { Popover } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { AddButton, DeleteButton } from '@/components/buttons'
import Select from './Select'
import { subdivisions } from '@/utils/utils'
import { useImmer } from 'use-immer'
import { PlusIcon } from '@heroicons/react/20/solid'
import { MinusIcon } from '@heroicons/react/20/solid'

const secondWidthFactor = 60

interface NoteProps {
	durationSec: number
	isActive?: boolean
	onSelected?: () => void
	onRemove?: () => void
	onAddAfter?: (duration: Subdivision | Subdivision[]) => void
	onAddBefore?: (duration: Subdivision | Subdivision[]) => void
	defaultDuration?: Subdivision
}

const durationOptions = subdivisions.map((s) => ({
	id: s,
	label: s,
}))

export const Note = ({
	durationSec,
	isActive,
	onSelected,
	onRemove,
	onAddAfter,
	onAddBefore,
	defaultDuration: preSelectedAddDuration = '4n',
}: NoteProps) => {
	return (
		<div
			style={{
				width: durationSec * secondWidthFactor + 'px',
				minWidth: durationSec * secondWidthFactor + 'px',
			}}
			className={clsx('relative h-8 px-[3px]')}
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
											defaultDuration={preSelectedAddDuration}
											onSelect={(durations) => {
												closeNote()
												onAddBefore(durations)
											}}
										/>
									</AddButton>
								)}
								{onRemove && <DeleteButton onConfirm={onRemove} />}
								{onAddAfter && (
									<AddButton>
										<DurationSelector
											defaultDuration={preSelectedAddDuration}
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
}

export const Track = ({
	melody,
	activeNoteIdx,
	onNoteClicked,
	onRemove,
	onAddBefore,
	onAddAfter,
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
							durationSec={note.durationSec}
							isActive={activeNoteIdx === i}
							onSelected={onNoteClicked && (() => onNoteClicked(i))}
							onRemove={onRemove && (() => onRemove(i))}
							onAddBefore={onAddBefore && ((dur) => onAddBefore(i, dur))}
							onAddAfter={onAddAfter && ((dur) => onAddAfter(i, dur))}
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
						<button
							type="button"
							className="rounded-full border border-slate-300 p-0 text-slate-400 shadow-sm shadow-slate-300 hover:border-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
						>
							<MinusIcon className="h-6 w-6" aria-hidden="true" />
						</button>
					</span>
				)
			})}
			<span className="mt-3 flex items-center justify-center">
				<button
					type="button"
					className=" mr-3 w-full rounded-md bg-teal-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
					onClick={() => {
						onSelect(durations.length ? durations : [preSelectedAddDuration])
					}}
				>
					Ok
				</button>
				<button
					type="button"
					className="rounded-full border border-slate-300 p-0 text-slate-400 shadow-sm shadow-slate-300 hover:border-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
				>
					<PlusIcon className="h-6 w-6" aria-hidden="true" />
				</button>
			</span>
		</div>
	)
}

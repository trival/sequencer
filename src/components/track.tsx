import { ProcessedMelody } from '@/utils/melody'
import clsx from 'clsx'
import { Subdivision } from 'tone/build/esm/core/type/Units'
import { Popover } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { AddButton, DeleteButton } from '@/components/buttons'

const secondWidthFactor = 60

interface NoteProps {
	durationSec: number
	isActive?: boolean
	onSelected?: () => void
	onRemove?: () => void
}

export const Note = ({
	durationSec,
	isActive,
	onSelected,
	onRemove = () => {},
}: NoteProps) => {
	return (
		<div
			style={{
				width: durationSec * secondWidthFactor + 'px',
				minWidth: durationSec * secondWidthFactor + 'px',
			}}
			className={clsx('relative px-[3px] h-8')}
		>
			<button
				className={clsx(
					'w-full h-full',
					isActive ? 'bg-cyan-300' : 'bg-slate-300',
				)}
				onClick={onSelected}
			></button>

			{isActive && (
				<Popover className="relative">
					<Popover.Button className="w-full min-w-fit flex justify-center">
						<EllipsisHorizontalIcon className="w-8 h-8" />
					</Popover.Button>

					<Popover.Panel className="absolute z-10 flex top-0 -translate-y-full bg-gray-100/70 rounded shadow-md">
						<AddButton />
						<DeleteButton onConfirm={onRemove} />
						<AddButton />
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
}: TrackProps) => {
	const countMeasures = melody.measureSec
		? Math.floor(melody.durationSec / melody.measureSec) + 1
		: 0
	return (
		<div className="relative px-2 min-w-fit">
			<div className="absolute h-full">
				{[...Array(countMeasures)].map((_, i) => (
					<span
						key={i}
						className="absolute w-[1px] h-full bg-cyan-300"
						style={{ left: melody.measureSec * i * secondWidthFactor }}
					></span>
				))}
			</div>
			<div className="flex items-center h-12">
				{melody.notes.map((note, i) => {
					return (
						<Note
							key={i}
							durationSec={note.durationSec}
							isActive={activeNoteIdx === i}
							onSelected={() => {
								onNoteClicked?.(i)
							}}
							onRemove={() => {
								onRemove?.(i)
							}}
						></Note>
					)
				})}
			</div>
		</div>
	)
}

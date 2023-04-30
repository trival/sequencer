import { ProcessedMelody } from '@/utils/melody'
import clsx from 'clsx'
import { Subdivision } from 'tone/build/esm/core/type/Units'
import { Popover } from '@headlessui/react'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

const secondWidthFactor = 50

interface NoteProps {
	durationSec: number
	isActive?: boolean
	onSelected?: () => void
}

export const Note = ({ durationSec, isActive, onSelected }: NoteProps) => {
	return (
		<div
			style={{ width: durationSec * secondWidthFactor + 'px' }}
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
					<Popover.Button>
						<EllipsisHorizontalIcon></EllipsisHorizontalIcon>
					</Popover.Button>

					<Popover.Panel className="absolute z-10">
						<div className="">huhu</div>
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

export const Track = ({ melody, activeNoteIdx, onNoteClicked }: TrackProps) => {
	const countMeasures = melody.measureSec
		? Math.floor(melody.durationSec / melody.measureSec) + 1
		: 0
	return (
		<div className="relative">
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
						></Note>
					)
				})}
			</div>
		</div>
	)
}

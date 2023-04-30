import { ProcessedMelody } from '@/utils/melody'
import clsx from 'clsx'
import { Subdivision } from 'tone/build/esm/core/type/Units'

const secondWidthFactor = 50

interface NoteProps {
	durationSec: number
	isActive?: boolean
}

export const Note = ({ durationSec, isActive }: NoteProps) => {
	return (
		<div
			style={{ width: durationSec * secondWidthFactor + 'px' }}
			className={clsx('relative px-[3px] h-8')}
		>
			<div className="h-full bg-slate-300"></div>
		</div>
	)
}

interface TrackProps {
	melody: ProcessedMelody
	activeNoteIdx?: number | null | undefined
	onNoteSelected?: (idx: number | null) => void
	onAddAfter?: (idx: number, duration: Subdivision | Subdivision[]) => void
	onAddBefore?: (idx: number, duration: Subdivision | Subdivision[]) => void
	onRemove?: (idx: number) => void
}

export const Track = ({ melody, activeNoteIdx }: TrackProps) => {
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
						></Note>
					)
				})}
			</div>
		</div>
	)
}

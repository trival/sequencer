import {
	ScaleHighlight,
	ToneColorType,
	ToneValue,
	getToneBgColor,
	midiToToneValue,
	mod,
} from '@/utils/tone-colors'
import clsx from 'clsx'
import { useMemo, useState } from 'react'
import * as Tone from 'tone'

type Mode = 'Record' | 'Play'

interface Props {
	activeNotes?: number[]
	onNoteActivated?: (midi: number) => void
	onNoteDeactivated?: (midi: number) => void
	baseNote?: number
	top?: number
	bottom?: number
	left?: number
	right?: number
	mode?: Mode
	scaleHighlight?: ScaleHighlight
	toneColorType?: ToneColorType
}

export const Keyboard: React.FC<Props> = ({
	activeNotes = [],
	baseNote = 48, // 'C3 midi number'
	top = 3,
	bottom = 1,
	left = 2,
	right = 3,
	mode = 'Record',
	scaleHighlight = ScaleHighlight.Major,
	toneColorType = ToneColorType.CircleOfFiths,
	onNoteActivated = () => {},
	onNoteDeactivated = () => {},
}: Props) => {
	const [pointerDown, setPointerDown] = useState(false)

	const baseFrequency = useMemo(
		() => Tone.Frequency(baseNote, 'midi'),
		[baseNote],
	)

	const notes = useMemo(() => {
		return activeNotes.reduce((acc, note) => {
			acc[note] = true
			return acc
		}, {} as Record<number, boolean>)
	}, [activeNotes])

	const toneBg = (tone: ToneValue) =>
		getToneBgColor(
			tone,
			midiToToneValue(baseNote),
			scaleHighlight,
			toneColorType,
		)

	const onPointerDown = (midi: number) => {
		setPointerDown(true)
		if (mode === 'Record') {
			if (notes[midi]) {
				onNoteDeactivated(midi)
			} else {
				onNoteActivated(midi)
			}
		} else {
			onNoteActivated(midi)
		}
	}

	const onPointerUp = (midi: number) => {
		setPointerDown(false)
		if (mode === 'Play') {
			onNoteDeactivated(midi)
		}
	}

	const onPointerEnter = (midi: number) => {
		if (pointerDown) {
			if (mode === 'Record') {
				if (notes[midi]) {
					onNoteDeactivated(midi)
				} else {
					onNoteActivated(midi)
				}
			} else {
				onNoteActivated(midi)
			}
		}
	}

	const onPointerOut = (midi: number) => {
		if (pointerDown) {
			if (mode === 'Play') {
				onNoteDeactivated(midi)
			}
		}
	}

	const stopPreventAnd = (fn: () => void) => (e: React.BaseSyntheticEvent) => {
		e.preventDefault()
		e.stopPropagation()
		fn()
		return false
	}

	// compute the keys
	const width = right + left + 1
	const height = top + bottom + 1

	const base = baseFrequency.transpose(-left + top * 5)
	const keys = []
	let rowStart = 0

	for (let i = 0; i < height; i++) {
		const row = []

		for (let j = 0; j < width; j++) {
			const val = rowStart + j
			const f = base.transpose(val)
			const midi = f.toMidi()
			row.push({
				frequency: f,
				midi,
				toneColor: mod(midi, 12) as ToneValue,
			})
		}

		keys.push(row)
		rowStart -= 5
	}

	return (
		<div>
			<div className="fixed z-10 h-full w-6 bg-gray-500 opacity-30 right-0"></div>
			<div className="fixed z-10 w-full h-6 bg-gray-500 opacity-30 bottom-0"></div>
			{keys.map((row) => (
				<div
					v-for="row in rows"
					key={row[0].toneColor}
					className="touch-none whitespace-nowrap"
				>
					{row.map((cell) => (
						<button
							className={clsx(
								'm-[2px] w-16 h-16 rounded-md box-border select-none touch-none text-gray-800',
								{ 'border-4 border-red-400': notes[cell.midi] },
							)}
							style={{ backgroundColor: toneBg(cell.toneColor) }}
							key={cell.toneColor}
							onPointerDown={stopPreventAnd(() => onPointerDown(cell.midi))}
							onPointerUp={stopPreventAnd(() => onPointerUp(cell.midi))}
							onPointerEnter={stopPreventAnd(() => onPointerEnter(cell.midi))}
							onPointerOut={stopPreventAnd(() => onPointerOut(cell.midi))}
							onContextMenu={stopPreventAnd(() => {})}
						>
							{notes[cell.midi] ? cell.frequency.toNote() : <span>&nbsp;</span>}
						</button>
					))}
				</div>
			))}
		</div>
	)
}

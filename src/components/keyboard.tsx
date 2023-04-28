import {
	ScaleHighlight,
	ToneColorType,
	ToneValue,
	getToneBgColor,
	midiToToneValue,
	mod,
} from '@/utils/tone-colors'
import { useMemo } from 'react'
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
	scaleHeighlight?: ScaleHighlight
	toneColors?: ToneColorType
}

let pointerdown = false

export const Keyboard: React.FC<Props> = ({
	activeNotes = [],
	baseNote = 48, // 'C3 midi number'
	top = 3,
	bottom = 1,
	left = 2,
	right = 3,
	mode = 'Record',
	scaleHeighlight = ScaleHighlight.Major,
	toneColors = ToneColorType.CircleOfFiths,
	onNoteActivated = () => {},
	onNoteDeactivated = () => {},
}) => {
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
		getToneBgColor(tone, midiToToneValue(baseNote), scaleHeighlight, toneColors)

	const returnFalse = () => false

	const onPointerDown = (midi: number) => {
		pointerdown = true
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
		pointerdown = false
		if (mode === 'Play') {
			onNoteDeactivated(midi)
		}
	}
	const onPointerEnter = (midi: number) => {
		if (pointerdown) {
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
		if (pointerdown) {
			if (mode === 'Play') {
				onNoteDeactivated(midi)
			}
		}
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
			{/* <div
			v-for="row in rows"
			:key="row[0].toneColor"
			className="touch-none whitespace-nowrap"
		>
			<button
				:className="[
					'm-[2px] w-16 h-16 rounded-md box-border select-none touch-none text-gray-800',
					{ 'border-4 border-red-400': activeNotes[cell.midi] },
				]"
				:style="{
					backgroundColor: toneBg(cell.toneColor),
				}"
				v-for="cell in row"
				:key="cell.toneColor"
				@pointerdown.prevent.stop="onPointerDown(cell.midi)"
				@pointerup.prevent.stop="onPointerUp(cell.midi)"
				@pointerenter.prevent.stop="onPointerEnter(cell.midi)"
				@pointerout.prevent.stop="onPointerOut(cell.midi)"
				@contextmenu.prevent.stop="returnFalse"
			>
				{{ cell.frequency.toNote() }}
			</button>
		</div> */}
		</div>
	)
}

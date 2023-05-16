'use client'

import { Track } from '@/components/track'
import { MelodyNote, useMelody } from '@/utils/melody'
import { toMidi } from '@/utils/utils'
import { useState } from 'react'
import { Subdivision } from 'tone/build/esm/core/type/Units'

const initialMelody: MelodyNote[] = [
	{ midiNotes: [toMidi('C3')], duration: '4n' },
	{ midiNotes: [toMidi('C3')], duration: '4n.' },
	{ midiNotes: [toMidi('C3')], duration: '4n.' },
	{ midiNotes: [toMidi('F3')], duration: '2n' },
	{ midiNotes: [], duration: '4n.' },
	{ midiNotes: [toMidi('F3')], duration: '8n' },
	{ midiNotes: [toMidi('G3')], duration: '2n' },
	{ midiNotes: [toMidi('G3')], duration: '2n' },
]

export const EditorPage = () => {
	const { melody, addNote, removeNote, changeDuration } =
		useMelody(initialMelody)

	const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null)

	const onNoteClicked = (idx: number) => {
		console.log('onNoteClicked', idx)
		if (activeNoteIdx === idx) {
			setActiveNoteIdx(null)
		} else {
			setActiveNoteIdx(idx)
		}
	}

	const onNoteAddedBefore = (
		idx: number,
		duration: Subdivision | Subdivision[],
	) => {
		console.log('onNoteAddedBefore', idx)
		addNote(idx, { duration, midiNotes: [] })
	}

	const onNoteAddedAfter = (
		idx: number,
		duration: Subdivision | Subdivision[],
	) => {
		console.log('onNoteAddedAfter', idx)
		addNote(idx + 1, { duration, midiNotes: [] })
		onNoteClicked(idx + 1)
	}

	const onNoteRemoved = (idx: number) => {
		console.log('onNoteRemoved', idx)
		removeNote(idx)
	}

	const onDurationChanged = (
		idx: number,
		duration: Subdivision | Subdivision[],
	) => {
		console.log('onDurationChanged', idx)
		changeDuration(idx, duration)
	}

	return (
		<div className="p-10">
			<h1>Track test</h1>
			<Track
				melody={melody}
				activeNoteIdx={activeNoteIdx}
				onNoteClicked={onNoteClicked}
				onRemove={onNoteRemoved}
				onAddBefore={onNoteAddedBefore}
				onAddAfter={onNoteAddedAfter}
				onDurationChanged={onDurationChanged}
			></Track>
		</div>
	)
}

export default EditorPage

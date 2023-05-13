'use client'

import { Track } from '@/components/track'
import { MelodyNote, emptyMelody, processMelody } from '@/utils/melody'
import { toMidi } from '@/utils/utils'
import { useEffect, useState } from 'react'
import { useImmer } from 'use-immer'

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
	const [melody, setMelody] = useImmer(emptyMelody())
	useEffect(() => {
		setMelody(processMelody(initialMelody))
	}, [setMelody])

	const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null)

	const onNoteClicked = (idx: number) => {
		console.log('onNoteClicked', idx)
		if (activeNoteIdx === idx) {
			setActiveNoteIdx(null)
		} else {
			setActiveNoteIdx(idx)
		}
	}

	const onNoteAddedBefore = (idx: number, dur: string) => {
		setMelody((melody) => {})
	}

	const onNoteRemoved = (idx: number) => {
		setMelody((melody) => {
			melody.notes = melody.notes.filter((_, i) => i !== idx)
		})
	}

	return (
		<div className="p-10">
			<h1>Track test</h1>
			<Track
				melody={melody}
				activeNoteIdx={activeNoteIdx}
				onNoteClicked={onNoteClicked}
				onRemove={onNoteRemoved}
				onAddAfter={(i, dur) => {
					console.log('onAddAfter', i, dur)
				}}
				onAddBefore={(i, dur) => {
					console.log('onAddBefore', i, dur)
				}}
			></Track>
		</div>
	)
}

export default EditorPage

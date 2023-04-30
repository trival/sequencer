import { Track } from '@/components/track'
import { MelodyNote, emptyMelody, processMelody } from '@/utils/melody'
import { toMidi } from '@/utils/utils'
import { useEffect, useState } from 'react'
import * as Tone from 'tone'

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
	const [melody, setMelody] = useState(emptyMelody())
	useEffect(() => {
		setMelody(processMelody(initialMelody))
	}, [])
	return (
		<div>
			<h1>Track test</h1>
			<Track melody={melody}></Track>
		</div>
	)
}

export default EditorPage

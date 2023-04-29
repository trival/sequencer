import { Keyboard } from '@/components/keyboard'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { useEffect, useState } from 'react'
import * as Tone from 'tone'
import { Set } from 'immutable'

// const Tone: typeof ToneImport = (ToneImport as any).default || ToneImport

const toMidi = (note: string) => Tone.Frequency(note).toMidi()

export default function Home() {
	const [activeNotes, setActiveNotes] = useState(Set<number>())
	const [synth, setSynth] = useState<Tone.PolySynth>()
	const [started, setStarted] = useState(false)

	function playNote(midi: number) {
		if (synth && !activeNotes.has(midi)) {
			synth.triggerAttack(Tone.Frequency(midi, 'midi').toFrequency())
			setActiveNotes(activeNotes.add(midi))
		}
	}

	function onDeactivateNote(midi: number) {
		if (synth && activeNotes.has(midi)) {
			synth.triggerRelease(Tone.Frequency(midi, 'midi').toFrequency())
			setActiveNotes(activeNotes.delete(midi))
		}
	}

	function onActivateNote(midi: number) {
		if (synth && !started) {
			Tone.start().then(() => {
				playNote(midi)
				setStarted(true)
			})
		} else {
			playNote(midi)
		}
	}

	useEffect(() => {
		setSynth(new Tone.PolySynth(Tone.Synth).toDestination())
	}, [])

	return (
		<div>
			<Keyboard
				activeNotes={Array.from(activeNotes)}
				onNoteActivated={onActivateNote}
				onNoteDeactivated={onDeactivateNote}
				baseNote={toMidi('C2')}
				top={10}
				right={9}
				scaleHighlight={ScaleHighlight.Major}
				toneColorType={ToneColorType.CircleOfFiths}
				mode="Play"
			/>
		</div>
	)
}

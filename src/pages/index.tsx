import { Keyboard } from '@/components/keyboard'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { toMidi } from '@/utils/utils'
import { useCallback, useEffect, useState } from 'react'
import * as Tone from 'tone'
import { useImmer } from 'use-immer'

// const Tone: typeof ToneImport = (ToneImport as any).default || ToneImport

interface State {
	activeNotes: Set<number>
	started: boolean
	synth?: Tone.PolySynth
}

export default function Home() {
	const [{ activeNotes, started, synth }, update] = useImmer<State>({
		activeNotes: new Set(),
		started: false,
	})

	const playNote = useCallback(
		(midi: number) => {
			if (synth && !activeNotes.has(midi)) {
				synth.triggerAttack(Tone.Frequency(midi, 'midi').toFrequency())
				update((s) => {
					s.activeNotes.add(midi)
				})
			}
		},
		[activeNotes, synth, update],
	)

	const onActivateNote = useCallback(
		(midi: number) => {
			if (synth && !started) {
				Tone.start().then(() => {
					playNote(midi)
					update((s) => {
						s.started = true
					})
				})
			} else {
				playNote(midi)
			}
		},
		[playNote, started, synth, update],
	)

	const onDeactivateNote = useCallback(
		(midi: number) => {
			if (synth && activeNotes.has(midi)) {
				synth.triggerRelease(Tone.Frequency(midi, 'midi').toFrequency())
				update((s) => {
					s.activeNotes.delete(midi)
				})
			}
		},
		[activeNotes, synth, update],
	)

	useEffect(() => {
		update((s) => {
			s.synth = new Tone.PolySynth(Tone.Synth).toDestination()
		})
	}, [update])

	return (
		<div>
			<Keyboard
				activeNotes={Array.from(activeNotes)}
				onNoteActivated={onActivateNote}
				onNoteDeactivated={onDeactivateNote}
				baseNote={toMidi('B2')}
				top={10}
				right={9}
				scaleHighlight={ScaleHighlight.Major}
				toneColorType={ToneColorType.CircleOfFiths}
				mode="Play"
			/>
		</div>
	)
}

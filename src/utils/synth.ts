import * as Tone from 'tone'
import { Time } from 'tone/build/esm/core/type/Units'
import { fromMidi } from './utils'
import { createSignal, onMount } from 'solid-js'

let started = false
let synth: Tone.PolySynth | undefined
const activeNotes: Set<number> = new Set()

export const useSynth = (Synth = Tone.Synth) => {
	const [playingNotes, setPlayingNotes] = createSignal(Array.from(activeNotes))

	const playNotes = (notes: number[], duration?: Time, time?: number) => {
		if (synth) {
			if (duration) {
				synth.triggerAttackRelease(
					notes.map((n) => fromMidi(n).toFrequency()),
					duration,
					time,
				)
			} else {
				const newNotes = notes.filter((n) => !activeNotes.has(n))
				if (newNotes.length) {
					synth.triggerAttack(newNotes.map((n) => fromMidi(n).toFrequency()))

					newNotes.forEach((note) => activeNotes.add(note))
					setPlayingNotes(Array.from(activeNotes))
				}
			}
		}
	}

	const play = (notes: number[], duration?: Time, time?: number) => {
		if (synth) {
			if (!started) {
				Tone.start().then(() => {
					playNotes(notes, duration, time)
					started = true
				})
			} else {
				playNotes(notes, duration, time)
			}
		}
	}

	const stop = (notes: number[]) => {
		if (synth) {
			synth.triggerRelease(notes.map((n) => fromMidi(n).toFrequency()))

			notes.forEach((note) => activeNotes.delete(note))
			setPlayingNotes(Array.from(activeNotes))
		}
	}

	onMount(() => {
		synth = new Tone.PolySynth(Synth).toDestination()
	})

	return {
		play,
		stop,
		playingNotes,
	}
}

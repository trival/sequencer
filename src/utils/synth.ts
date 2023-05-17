import { useCallback, useEffect, useMemo, useState } from 'react'
import * as Tone from 'tone'
import { Time } from 'tone/build/esm/core/type/Units'
import { fromMidi } from './utils'

let started = false
let synth: Tone.PolySynth | undefined
const activeNotes: Set<number> = new Set()

export const useSynth = (Synth = Tone.Synth) => {
	const [playingNotes, setPlayingNotes] = useState(Array.from(activeNotes))

	const playNotes = useCallback(
		(notes: number[], duration?: Time, time?: number) => {
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
		},
		[],
	)

	const play = useCallback(
		(notes: number[], duration?: Time, time?: number) => {
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
		},
		[playNotes],
	)

	const stop = useCallback((notes: number[]) => {
		if (synth) {
			synth.triggerRelease(notes.map((n) => fromMidi(n).toFrequency()))

			notes.forEach((note) => activeNotes.delete(note))
			setPlayingNotes(Array.from(activeNotes))
		}
	}, [])

	useEffect(() => {
		synth = new Tone.PolySynth(Synth).toDestination()
	}, [Synth])

	return useMemo(
		() => ({
			play,
			stop,
			playingNotes,
		}),
		[play, playingNotes, stop],
	)
}

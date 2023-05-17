import { useCallback, useEffect, useMemo } from 'react'
import * as Tone from 'tone'
import { Time } from 'tone/build/esm/core/type/Units'
import { fromMidi } from './utils'

let started = false
let synth: Tone.PolySynth | undefined
const playingNotes: Set<number> = new Set()

export const useSynth = (Synth = Tone.Synth) => {
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
					const newNotes = notes.filter((n) => !playingNotes.has(n))
					if (newNotes.length) {
						synth.triggerAttack(newNotes.map((n) => fromMidi(n).toFrequency()))

						newNotes.forEach((note) => playingNotes.add(note))
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

			notes.forEach((note) => playingNotes.delete(note))
		}
	}, [])

	const getPlayingNotes = useCallback(() => Array.from(playingNotes), [])

	useEffect(() => {
		synth = new Tone.PolySynth(Synth).toDestination()
	}, [Synth])

	return useMemo(
		() => ({
			play,
			stop,
			getPlayingNotes,
		}),
		[getPlayingNotes, play, stop],
	)
}

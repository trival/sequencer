import { useCallback, useEffect, useMemo } from 'react'
import * as Tone from 'tone'
import { Time } from 'tone/build/esm/core/type/Units'
import { useImmer } from 'use-immer'
import { fromMidi } from './utils'

interface State {
	playingNotes: Set<number>
	started: boolean
	synth?: Tone.PolySynth
}

export const useSynth = (Synth = Tone.Synth) => {
	const [{ playingNotes, started, synth }, update] = useImmer<State>({
		playingNotes: new Set(),
		started: false,
	})

	const playNote = useCallback(
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

						update((s) => {
							newNotes.forEach((note) => s.playingNotes.add(note))
						})
					}
				}
			}
		},
		[playingNotes, synth, update],
	)

	const play = useCallback(
		(notes: number[], duration?: Time, time?: number) => {
			if (synth) {
				if (!started) {
					Tone.start().then(() => {
						playNote(notes, duration, time)
						update((s) => {
							s.started = true
						})
					})
				} else {
					playNote(notes, duration, time)
				}
			}
		},
		[playNote, started, synth, update],
	)

	const stop = useCallback(
		(notes: number[]) => {
			if (synth) {
				synth.triggerRelease(notes.map((n) => fromMidi(n).toFrequency()))

				update((s) => {
					notes.forEach((note) => s.playingNotes.delete(note))
				})
			}
		},
		[synth, update],
	)

	const getPlayingNotes = useCallback(
		() => Array.from(playingNotes),
		[playingNotes],
	)

	useEffect(() => {
		update((s) => {
			s.synth = new Tone.PolySynth(Synth).toDestination()
		})
	}, [Synth, update])

	return {
		play,
		stop,
		getPlayingNotes,
	}
}

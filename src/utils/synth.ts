import * as Tone from 'tone'
import { Time } from 'tone/build/esm/core/type/Units'
import { fromMidi } from './utils'
import { createSignal } from 'solid-js'
import { Instrument } from '@/datamodel'

export interface SynthPlayer {
	play: (
		instrument: number,
		notes: number[],
		duration?: Time,
		time?: number,
	) => void
	stop: (instrument: number, notes: number[]) => void
	playingNotes: () => number[][]
	destroy: () => void
}

interface ActiveSynth {
	idx: number
	synth: Tone.PolySynth
	activeNotes: Set<number>
}

let started = false

export const useSynth = (instruments?: Instrument[]): SynthPlayer => {
	if (!instruments?.length) {
		instruments = [{}]
	}

	const synths: ActiveSynth[] = instruments.map((instrument, idx) => {
		const synth = new Tone.PolySynth(Tone.Synth, {
			envelope: {
				attack: instrument.attack ?? 0.005,
				decay: instrument.decay ?? 0.1,
				sustain: instrument.sustain ?? 0.3,
				release: instrument.release ?? 1,
			},
		})
		synth.volume.value = Tone.gainToDb(instrument.volume || 1)
		synth.toDestination()

		return {
			idx,
			synth,
			activeNotes: new Set<number>(),
		}
	})

	const [playingNotes, setPlayingNotes] = createSignal(
		synths.map((s) => Array.from(s.activeNotes)),
	)

	const playNotes = (
		instrument: number,
		notes: number[],
		duration?: Time,
		time?: number,
	) => {
		const current = synths[instrument] || synths[0]
		if (duration) {
			current.synth.triggerAttackRelease(
				notes.map((n) => fromMidi(n).toFrequency()),
				duration,
				time,
			)
		} else {
			const newNotes = notes.filter((n) => !current.activeNotes.has(n))
			if (newNotes.length) {
				current.synth.triggerAttack(
					newNotes.map((n) => fromMidi(n).toFrequency()),
				)

				newNotes.forEach((note) => current.activeNotes.add(note))
				setPlayingNotes((ns) => {
					const res = [...ns]
					res[current.idx] = Array.from(current.activeNotes)
					return res
				})
			}
		}
	}

	const play = (
		instrument: number,
		notes: number[],
		duration?: Time,
		time?: number,
	) => {
		if (!started) {
			Tone.start().then(() => {
				playNotes(instrument, notes, duration, time)
				started = true
			})
		} else {
			playNotes(instrument, notes, duration, time)
		}
	}

	const stop = (instrument: number, notes: number[]) => {
		const current = synths[instrument] || synths[0]
		current.synth.triggerRelease(notes.map((n) => fromMidi(n).toFrequency()))

		notes.forEach((note) => current.activeNotes.delete(note))

		setPlayingNotes((ns) => {
			const res = [...ns]
			res[current.idx] = Array.from(current.activeNotes)
			return res
		})
	}

	function destroy() {
		synths.forEach((synth) => {
			synth.synth.dispose()
		})
	}

	return {
		play,
		stop,
		playingNotes,
		destroy,
	}
}

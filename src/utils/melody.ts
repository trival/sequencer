import * as Tone from 'tone'
import { Subdivision, Time } from 'tone/build/esm/core/type/Units'

export interface MelodyNote {
	midiNotes: number[]
	duration: Subdivision | Subdivision[]
}

export interface ProcessedNote {
	midiNotes: number[]
	time: Time
	duration: Time
	durationSec: number
}

export interface ProcessedMelody {
	notes: ProcessedNote[]
	duration: Time
	durationSec: number
	measureSec: number
}

export function emptyMelody(): ProcessedMelody {
	return { duration: 0, durationSec: 0, notes: [], measureSec: 0 }
}

export function processMelody(melody: MelodyNote[]): ProcessedMelody {
	const notes: ProcessedNote[] = []
	const subdivisions: Subdivision[] = []

	for (const note of melody) {
		const duration = collectDurations(note.duration)
		notes.push({
			midiNotes: note.midiNotes,
			duration,
			durationSec: Tone.Time(duration).toSeconds(),
			time: Tone.Time(collectDurations(subdivisions)).toBarsBeatsSixteenths(),
		})

		Array.isArray(note.duration)
			? subdivisions.push(...note.duration)
			: subdivisions.push(note.duration)
	}

	const duration = collectDurations(subdivisions)

	return {
		notes,
		duration,
		durationSec: Tone.Time(duration).toSeconds(),
		measureSec: Tone.Time('1m').toSeconds(),
	}
}

function collectDurations(duration: Subdivision | Subdivision[]): Time {
	if (!Array.isArray(duration)) {
		return duration
	} else if (duration.length === 0) {
		return 0
	} else if (duration.length === 1) {
		return duration[0]
	} else {
		return duration.reduce((acc, val) => {
			if (acc[val]) {
				acc[val]++
			} else {
				acc[val] = 1
			}
			return acc
		}, {} as Record<Subdivision, number>)
	}
}

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
	partNotes: ProcessedNote[]
	duration: Time
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

	return {
		partNotes: notes,
		duration: collectDurations(subdivisions),
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

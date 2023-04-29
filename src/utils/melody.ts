import * as Tone from 'tone'
import { Subdivision, Time } from 'tone/build/esm/core/type/Units'

export interface MelodyNote {
	midiNotes: number[]
	duration: Subdivision | Subdivision[]
}

export interface PartNote {
	midiNotes: number[]
	time: Time
	duration: Time
}

export function toPartValues(melody: MelodyNote[]): {
	partNotes: PartNote[]
	duration: Time
} {
	const result: PartNote[] = []
	const subdivisions: Subdivision[] = []

	for (const note of melody) {
		if (note.midiNotes.length) {
			result.push({
				midiNotes: note.midiNotes,
				duration: collectDurations(note.duration),
				time: Tone.Time(collectDurations(subdivisions)).toBarsBeatsSixteenths(),
			})
		}

		Array.isArray(note.duration)
			? subdivisions.push(...note.duration)
			: subdivisions.push(note.duration)
	}

	console.log(result)
	return {
		partNotes: result,
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

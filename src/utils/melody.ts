import { useEffect } from 'react'
import * as Tone from 'tone'
import { Subdivision, Time, TimeObject } from 'tone/build/esm/core/type/Units'
import { useImmer } from 'use-immer'

export interface MelodyNote {
	midiNotes: number[]
	duration: Subdivision | Subdivision[]
}

export interface ProcessedNote {
	midiNotes: number[]
	time: Time
	duration: TimeObject
	durationSec: number
}

export interface ProcessedMelody {
	notes: ProcessedNote[]
	duration: TimeObject
	durationSec: number
	measureSec: number
}

export function emptyMelody(): ProcessedMelody {
	return { duration: {}, durationSec: 0, notes: [], measureSec: 0 }
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

function collectDurations(duration: Subdivision | Subdivision[]): TimeObject {
	if (!Array.isArray(duration)) {
		duration = [duration]
	}
	return duration.reduce((acc, val) => {
		if (val) {
			if (acc[val]) {
				acc[val]++
			} else {
				acc[val] = 1
			}
		}
		return acc
	}, {} as Record<Subdivision, number>)
}

function addDurations(d1: TimeObject, d2: TimeObject): TimeObject {
	const result = { ...d1 }
	for (const key in d2) {
		const k = key as Subdivision
		if (result[k]) {
			result[k]! += d2[k] || 0
		} else {
			result[k] = d2[k]
		}
	}
	return result
}

export const useMelody = (melodyNotes: MelodyNote[] = []) => {
	const [melody, updateMelody] = useImmer(emptyMelody())
	useEffect(() => {
		updateMelody(processMelody(melodyNotes))
	}, [melodyNotes, updateMelody])

	const removeNote = (idx: number) => {
		updateMelody((melody) => {
			const note = melody.notes[idx]
			melody.notes = melody.notes.filter((_, i) => i !== idx)
			melody.durationSec -= note.durationSec
		})
	}

	return {
		melody,
		updateMelody,
		removeNote,
	}
}

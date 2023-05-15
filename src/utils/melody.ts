import { useCallback, useEffect, useMemo } from 'react'
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

export function processNote(noteData: MelodyNote): ProcessedNote {
	const duration = collectDurations(noteData.duration)
	return {
		midiNotes: noteData.midiNotes,
		duration,
		durationSec: Tone.Time(duration).toSeconds(),
		time: 0,
	}
}

export function processMelody(melody: MelodyNote[]): ProcessedMelody {
	const notes: ProcessedNote[] = []
	const subdivisions: Subdivision[] = []

	for (const note of melody) {
		const newNote = processNote(note)
		newNote.time = Tone.Time(
			collectDurations(subdivisions),
		).toBarsBeatsSixteenths()
		notes.push(newNote)

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

function subDurations(d1: TimeObject, d2: TimeObject): TimeObject {
	const result = { ...d1 }
	for (const key in d2) {
		const k = key as Subdivision
		if (result[k]) {
			result[k]! -= d2[k] || 0
		}
	}
	return result
}

const divideAt = <T>(xs: T[], idx: number): [T[], T[]] => {
	return [xs.slice(0, idx), xs.slice(idx)]
}

export const useMelody = (melodyNotes: MelodyNote[] = []) => {
	const [melody, updateMelody] = useImmer(emptyMelody())
	useEffect(() => {
		updateMelody(processMelody(melodyNotes))
	}, [melodyNotes, updateMelody])

	const removeNote = useCallback(
		(idx: number) => {
			updateMelody((melody) => {
				const note = melody.notes[idx]
				melody.notes = melody.notes.filter((_, i) => i !== idx)
				melody.durationSec -= note.durationSec
				melody.duration = subDurations(melody.duration, note.duration)
			})
		},
		[updateMelody],
	)

	const addNote = useCallback(
		(idx: number, noteData: MelodyNote) => {
			updateMelody((melody) => {
				if (idx < 0 || idx > melody.notes.length) {
					return
				}

				const [before, after] = divideAt(melody.notes, idx)

				let beforeDuration = before.reduce(
					(acc, val) => addDurations(acc, val.duration),
					{} as TimeObject,
				)

				const note = processNote(noteData)
				note.time = Tone.Time(beforeDuration).toBarsBeatsSixteenths()

				beforeDuration = addDurations(beforeDuration, note.duration)

				after.forEach((n) => {
					n.time = Tone.Time(beforeDuration).toBarsBeatsSixteenths()
					beforeDuration = addDurations(beforeDuration, n.duration)
				})

				melody.notes = [...before, note, ...after]
				melody.duration = beforeDuration
				melody.durationSec = melody.durationSec + note.durationSec
			})
		},
		[updateMelody],
	)

	return useMemo(
		() => ({
			melody,
			updateMelody,
			removeNote,
			addNote,
		}),
		[melody, updateMelody, removeNote, addNote],
	)
}

import { produce } from 'immer'
import { createSignal, onMount } from 'solid-js'
import * as Tone from 'tone'
import { Subdivision, Time, TimeObject } from 'tone/build/esm/core/type/Units'

export interface TrackNote {
	midiNotes: number[]
	duration: Subdivision | Subdivision[]
}

export interface SongData {
	tracks: TrackNote[][]
	bpm: number
	swing?: number
	swingSubdivision?: Subdivision
}

export interface ProcessedNote {
	midiNotes: number[]
	time: Time
	duration: TimeObject
	subdivisions: Subdivision | Subdivision[]
	durationSec: number
}

export interface ProcessedTrack {
	notes: ProcessedNote[]
	duration: TimeObject
	durationSec: number
	measureSec: number
}

export function emptyTrack(): ProcessedTrack {
	return { duration: {}, durationSec: 0, notes: [], measureSec: 0 }
}

export function processTrack(trackData: TrackNote[]): ProcessedTrack {
	const track = emptyTrack()
	track.notes = trackData.map((n) => ({
		midiNotes: n.midiNotes,
		subdivisions: n.duration,
		duration: {},
		durationSec: 0,
		time: 0,
	}))

	recalculateTrack(track)

	return track
}

export function recalculateTrack(track: ProcessedTrack): void {
	const subdivisions: Subdivision[] = []

	for (const note of track.notes) {
		note.duration = collectDurations(note.subdivisions)
		note.durationSec = Tone.Time(note.duration).toSeconds()
		note.time = Tone.Time(collectDurations(subdivisions)).toSeconds()

		Array.isArray(note.subdivisions)
			? subdivisions.push(...note.subdivisions)
			: subdivisions.push(note.subdivisions)
	}

	const duration = collectDurations(subdivisions)

	track.duration = duration
	track.durationSec = Tone.Time(duration).toSeconds()
	track.measureSec = Tone.Time('1m').toSeconds()
}

function collectDurations(duration: Subdivision | Subdivision[]): TimeObject {
	if (!Array.isArray(duration)) {
		duration = [duration]
	}
	return duration.reduce(
		(acc, val) => {
			if (val) {
				if (acc[val]) {
					acc[val]++
				} else {
					acc[val] = 1
				}
			}
			return acc
		},
		{} as Record<Subdivision, number>,
	)
}

export function toDurations(duration: TimeObject): Subdivision[] {
	const result: Subdivision[] = []
	for (const key in duration) {
		const k = key as Subdivision
		for (let i = 0; i < duration[k]!; i++) {
			result.push(k)
		}
	}
	return result
}

const divideAt = <T>(xs: T[], idx: number): [T[], T[]] => {
	return [xs.slice(0, idx), xs.slice(idx)]
}

export const useSong = (data: SongData) => {
	const [song, setSong] = createSignal<ProcessedTrack[]>([])
	const updateSong = (
		fn: ((song: ProcessedTrack[]) => void) | ProcessedTrack[],
	) => {
		setSong(typeof fn === 'function' ? produce((draft) => fn(draft)) : fn)
	}

	onMount(() => {
		Tone.Transport.start()
		Tone.Transport.bpm.value = data.bpm
		updateSong(data.tracks.map((track) => processTrack(track)))
	})

	const removeNote = (trackIdx: number, noteIdx: number) => {
		updateSong((song) => {
			const track = song[trackIdx]
			if (track) {
				track.notes = track.notes.filter((_, i) => i !== noteIdx)
				recalculateTrack(track)
			}
		})
	}

	const changeDuration = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		updateSong((song) => {
			const track = song[trackIdx]
			if (track) {
				const note = track.notes[noteIdx]
				if (note) {
					note.subdivisions = duration
					recalculateTrack(track)
				}
			}
		})
	}

	const addNote = (trackIdx: number, noteIdx: number, noteData: TrackNote) => {
		updateSong((song) => {
			const track = song[trackIdx]
			if (track) {
				const [before, after] = divideAt(track.notes, noteIdx)

				track.notes = [
					...before,
					{
						midiNotes: noteData.midiNotes,
						subdivisions: noteData.duration,
						duration: {},
						durationSec: 0,
						time: 0,
					},
					...after,
				]

				recalculateTrack(track)
			}
		})
	}

	const updateNoteTones = (
		trackIdx: number,
		noteIdx: number,
		midiNotes: number[],
	) => {
		updateSong((song) => {
			const track = song[trackIdx]
			if (!track) return
			const note = track.notes[noteIdx]
			if (!note) return
			note.midiNotes = midiNotes
		})
	}

	return {
		song,
		updateSong,
		removeNote,
		addNote,
		changeDuration,
		updateNoteTones,
	}
}

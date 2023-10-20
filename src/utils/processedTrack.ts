import * as Tone from 'tone'
import { Subdivision, Time, TimeObject } from 'tone/build/esm/core/type/Units'
import { SongData } from '@/datamodel'

export interface ProcessedNote {
	midiNotes: number[]
	time: Time
	duration: TimeObject
	durationSec: number
}

export interface ProcessedTrack {
	notes: ProcessedNote[]
	duration: TimeObject
	durationSec: number
	measureSec: number
}

export function emptyTrack(): ProcessedTrack {
	return {
		duration: {},
		durationSec: 0,
		notes: [
			{
				midiNotes: [],
				duration: {},
				durationSec: 0,
				time: 0,
			},
		],
		measureSec: 0,
	}
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

export function processSong(song: SongData): ProcessedTrack[] {
	Tone.Transport.bpm.value = song.bpm

	const tracks: ProcessedTrack[] = []

	for (const trackData of song.tracks) {
		const track = emptyTrack()
		track.notes = trackData.notes.map((n) => ({
			midiNotes: n.midiNotes,
			duration: {},
			durationSec: 0,
			time: 0,
		}))

		const subdivisions: Subdivision[] = []

		track.notes.forEach((note, i) => {
			const noteData = trackData.notes[i]
			note.duration = collectDurations(noteData.duration)
			note.durationSec = Tone.Time(note.duration).toSeconds()
			note.time = Tone.Time(collectDurations(subdivisions)).toSeconds()

			Array.isArray(noteData.duration)
				? subdivisions.push(...noteData.duration)
				: subdivisions.push(noteData.duration)
		})

		const duration = collectDurations(subdivisions)

		track.duration = duration
		track.durationSec = Tone.Time(duration).toSeconds()
		track.measureSec = Tone.Time('1m').toSeconds()

		tracks.push(track)
	}

	return tracks
}

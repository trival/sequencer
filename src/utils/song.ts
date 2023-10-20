import { SongData, TrackNote, SongProperties, Song, Track } from '@/datamodel'
import { createSignal } from 'solid-js'
import * as Tone from 'tone'
import { Subdivision, TimeObject } from 'tone/build/esm/core/type/Units'
import * as uuid from 'uuid'

export function emptySong(): Song {
	return {
		id: uuid.v4(),
		data: emptySongData(),
		meta: {
			userId: '',
		},
	}
}

export function emptyTrack(): Track {
	return { notes: [{ midiNotes: [], duration: '4n' }], gain: 1, instrument: 0 }
}

export function emptySongData(): SongData {
	return {
		bpm: 120,
		tracks: [emptyTrack()],
	}
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

export interface SongEditor {
	data: () => SongData
	updateProps: (data: Partial<SongProperties>) => void
	removeNote: (trackIdx: number, noteIdx: number) => void
	addNote: (trackIdx: number, noteIdx: number, noteData: TrackNote) => void
	changeDuration: (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => void
	updateNoteTones: (
		trackIdx: number,
		noteIdx: number,
		midiNotes: number[],
	) => void
}

export const useSongEditor = (data: SongData): SongEditor => {
	if (!data.tracks.length) {
		data.tracks = emptySongData().tracks
	}

	const [song, setSong] = createSignal<SongData>(data)

	const removeNote = (trackIdx: number, noteIdx: number) => {
		updateTracks((song) => {
			const track = song[trackIdx]
			if (track) {
				track.notes = track.notes.filter((_, i) => i !== noteIdx)
				if (!track.notes.length) {
					track.notes.push(emptyTrack().notes[0])
				}
				recalculateTrack(track)
			}
		})
	}

	const changeDuration = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		updateTracks((song) => {
			const track = song[trackIdx]
			if (track) {
				const note = track.notes[noteIdx]
				if (note) {
					note.data.duration = duration
					recalculateTrack(track)
				}
			}
		})
	}

	const addNote = (trackIdx: number, noteIdx: number, noteData: TrackNote) => {
		updateTracks((song) => {
			const track = song[trackIdx]
			if (track) {
				const [before, after] = divideAt(track.notes, noteIdx)

				track.notes = [
					...before,
					{
						data: noteData,
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
		updateTracks((song) => {
			const track = song[trackIdx]
			if (!track) return
			const note = track.notes[noteIdx]
			if (!note) return
			note.data.midiNotes = midiNotes
		})
	}

	const updateProps = (data: Partial<SongProperties>) => {
		setSong((prev) => ({ ...prev, ...data }))
		if (data.bpm) {
			Tone.Transport.bpm.value = data.bpm
			updateTracks((song) => {
				for (const track of song) {
					recalculateTrack(track)
				}
			})
		}
	}

	return {
		tracks,
		data: rawData,
		updateProps,
		removeNote,
		addNote,
		changeDuration,
		updateNoteTones,
	}
}

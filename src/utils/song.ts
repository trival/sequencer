import { SongData, TrackNote, SongProperties, Song, Track } from '@/datamodel'
import { produce } from 'immer'
import { createSignal } from 'solid-js'
import { Subdivision, TimeObject } from 'tone/build/esm/core/type/Units'
import * as uuid from 'uuid'
import { divideAt } from './utils'

export function emptySong(): Song {
	return {
		id: uuid.v4(),
		data: emptySongData(),
		meta: {
			userId: '',
		},
	}
}

export function songFromMelody(melody: TrackNote[]): Song {
	const song = emptySong()
	song.data.tracks[0].notes = melody
	return song
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
	const updateSong = (fn: ((song: SongData) => void) | SongData) => {
		setSong(typeof fn === 'function' ? produce((draft) => fn(draft)) : fn)
	}

	const removeNote = (trackIdx: number, noteIdx: number) => {
		updateSong((song) => {
			const track = song.tracks[trackIdx]
			if (track) {
				track.notes = track.notes.filter((_, i) => i !== noteIdx)
				if (!track.notes.length) {
					track.notes.push(emptyTrack().notes[0])
				}
			}
		})
	}

	const changeDuration = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		updateSong((song) => {
			const track = song.tracks[trackIdx]
			if (track) {
				const note = track.notes[noteIdx]
				if (note) {
					note.duration = duration
				}
			}
		})
	}

	const addNote = (trackIdx: number, noteIdx: number, noteData: TrackNote) => {
		updateSong((song) => {
			const track = song.tracks[trackIdx]
			if (track) {
				const [before, after] = divideAt(track.notes, noteIdx)
				track.notes = [...before, noteData, ...after]
			}
		})
	}

	const updateNoteTones = (
		trackIdx: number,
		noteIdx: number,
		midiNotes: number[],
	) => {
		updateSong((song) => {
			const track = song.tracks[trackIdx]
			if (!track) return
			const note = track.notes[noteIdx]
			if (!note) return
			note.midiNotes = midiNotes
		})
	}

	const updateProps = (data: Partial<SongProperties>) => {
		setSong((prev) => ({ ...prev, ...data }))
	}

	return {
		data: song,
		updateProps,
		removeNote,
		addNote,
		changeDuration,
		updateNoteTones,
	}
}

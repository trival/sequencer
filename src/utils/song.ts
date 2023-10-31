import { SongData, TrackNote, SongProperties, Song, Track } from '@/datamodel'
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

	const removeNote = (trackIdx: number, noteIdx: number) => {
		setSong((song) => {
			const tracks = [...song.tracks]
			const track = tracks[trackIdx]
			if (track) {
				let newNotes = track.notes.filter((_, i) => i !== noteIdx)
				if (!newNotes.length) {
					newNotes = emptyTrack().notes
				}
				tracks[trackIdx] = { ...track, notes: newNotes }
				return { ...song, tracks }
			}
			return song
		})
	}

	const changeDuration = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		setSong((song) => {
			const tracks = [...song.tracks]
			const track = tracks[trackIdx]
			if (track) {
				const notes = [...track.notes]
				const note = notes[noteIdx]
				if (note) {
					notes[noteIdx] = { ...note, duration }
					tracks[trackIdx] = { ...track, notes }
					return { ...song, tracks }
				}
			}
			return song
		})
	}

	const addNote = (trackIdx: number, noteIdx: number, noteData: TrackNote) => {
		setSong((song) => {
			const tracks = [...song.tracks]
			const track = tracks[trackIdx]
			if (track) {
				const [before, after] = divideAt(track.notes, noteIdx)
				const notes = [...before, noteData, ...after]
				tracks[trackIdx] = { ...track, notes }
				return { ...song, tracks }
			}
			return song
		})
	}

	const updateNoteTones = (
		trackIdx: number,
		noteIdx: number,
		midiNotes: number[],
	) => {
		setSong((song) => {
			const tracks = [...song.tracks]
			const track = tracks[trackIdx]
			if (!track) return song
			const notes = [...track.notes]
			const note = notes[noteIdx]
			if (!note) return song
			notes[noteIdx] = { ...note, midiNotes }
			tracks[trackIdx] = { ...track, notes }
			return { ...song, tracks }
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

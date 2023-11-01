import {
	TrackNote,
	SongProperties,
	SongEntity,
	Track,
	Song,
	EditorSettings,
} from '@/datamodel'
import { createSignal } from 'solid-js'
import { Subdivision, TimeObject } from 'tone/build/esm/core/type/Units'
import * as uuid from 'uuid'
import { divideAt } from './utils'
import { defaultEditorSettings } from './settings'

export function emptySong(defaultNoteDuration: Subdivision = '4n'): Song {
	return {
		bpm: 120,
		tracks: [emptyTrack(defaultNoteDuration)],
	}
}

export function emptySongEntity(): SongEntity {
	return {
		id: uuid.v4(),
		data: { song: emptySong() },
		meta: {
			userId: '',
		},
	}
}

export function songFromMelody(melody: TrackNote[]): Song {
	const song = emptySong()
	song.tracks[0].notes = melody
	return song
}

export function emptyTrack(defaultNoteDuration: Subdivision = '4n'): Track {
	return {
		notes: [{ midiNotes: [], duration: defaultNoteDuration }],
		instrument: 0,
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

export interface SongState {
	data: () => Song
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

export const createSongState = (
	data: Song,
	editorSetting: EditorSettings = defaultEditorSettings,
): SongState => {
	if (!data.tracks.length) {
		data.tracks = emptySong(editorSetting.defaultNoteDuration).tracks
	}

	const [song, setSong] = createSignal<Song>(data)

	const removeNote = (trackIdx: number, noteIdx: number) => {
		setSong((song) => {
			const tracks = [...song.tracks]
			const track = tracks[trackIdx]
			if (track) {
				let newNotes = track.notes.filter((_, i) => i !== noteIdx)
				if (!newNotes.length) {
					newNotes = emptyTrack(editorSetting.defaultNoteDuration).notes
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

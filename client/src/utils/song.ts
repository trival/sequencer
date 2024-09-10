import {
	Song,
	SongEntity,
	SongProperties,
	Subdivision,
	Track,
	TrackNote,
} from '@/datamodel'
import { TimeObject } from 'tone/build/esm/core/type/Units'
import * as uuid from 'uuid'
import { divideAt } from './utils'

export function emptySong(defaultNoteDuration: Subdivision = '4n'): Song {
	return {
		bpm: 120,
		tracks: [emptyTrack(defaultNoteDuration)],
	}
}

export function emptySongEntity(): SongEntity {
	return {
		id: uuid.v4(),
		timestamp: Date.now(),
		data: { song: emptySong() },
		meta: {
			userId: '',
			title: '',
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

export interface SongActions {
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
	addTrack: (trackIdx?: number) => void
}

export const createSongActions = (
	data: () => Song,
	onSongChange: (song: Song) => void,
	defaultNoteDuration: Subdivision = '4n',
): SongActions => {
	// TODO: Refactor this validation to upper scope
	if (!data().tracks.length) {
		onSongChange({
			...data(),
			tracks: emptySong(defaultNoteDuration).tracks,
		})
	}

	const removeNote = (trackIdx: number, noteIdx: number) => {
		const song = data()
		const tracks = [...song.tracks]
		const track = tracks[trackIdx]
		if (track) {
			const newNotes = track.notes.filter((_, i) => i !== noteIdx)
			if (!newNotes.length) {
				tracks.splice(trackIdx, 1)
			} else {
				tracks[trackIdx] = { ...track, notes: newNotes }
			}
			onSongChange({ ...song, tracks })
		}
	}

	const changeDuration = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		const song = data()
		const tracks = [...song.tracks]
		const track = tracks[trackIdx]
		if (track) {
			const notes = [...track.notes]
			const note = notes[noteIdx]
			if (note) {
				notes[noteIdx] = { ...note, duration }
				tracks[trackIdx] = { ...track, notes }
				onSongChange({ ...song, tracks })
			}
		}
	}

	const addNote = (trackIdx: number, noteIdx: number, noteData: TrackNote) => {
		const song = data()
		const tracks = [...song.tracks]
		const track = tracks[trackIdx]
		if (track) {
			const [before, after] = divideAt(track.notes, noteIdx)
			const notes = [...before, noteData, ...after]
			tracks[trackIdx] = { ...track, notes }
			onSongChange({ ...song, tracks })
		}
	}

	const updateNoteTones = (
		trackIdx: number,
		noteIdx: number,
		midiNotes: number[],
	) => {
		const song = data()

		const tracks = [...song.tracks]
		const track = tracks[trackIdx]
		if (!track) return

		const notes = [...track.notes]
		const note = notes[noteIdx]
		if (!note) return

		notes[noteIdx] = { ...note, midiNotes }
		tracks[trackIdx] = { ...track, notes }
		onSongChange({ ...song, tracks })
	}

	const updateProps = (newProps: Partial<SongProperties>) => {
		onSongChange({ ...data(), ...newProps })
	}

	const addTrack = (trackIdx?: number) => {
		const song = data()
		const tracks = [...song.tracks]
		const newTrack = emptyTrack(defaultNoteDuration)
		if (trackIdx === undefined) {
			tracks.push(newTrack)
		} else {
			tracks.splice(trackIdx, 0, newTrack)
		}
		return { ...song, tracks }
	}

	return {
		updateProps,
		removeNote,
		addNote,
		changeDuration,
		updateNoteTones,
		addTrack,
	}
}

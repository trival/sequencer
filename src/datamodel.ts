import { Subdivision } from 'tone/build/esm/core/type/Units'
import { ScaleHighlight, ToneColorType } from './utils/tone-colors'

export interface Profile {
	userId: string
	username: string
	color: string
}

export interface Collection {
	id: string
	userId: string
	title: string
	description?: string
}

export interface KeyboardSettings {
	baseNote: number
	offsetX: number
	offsetY: number
	maxRows: number
	maxCols: number
	keyLength: number
	scaleHighlight: ScaleHighlight
	toneColorType: ToneColorType
}

export interface TrackSettings {
	pxPerBeat: number
}

export interface TrackNote {
	midiNotes: number[]
	duration: Subdivision | Subdivision[]
}

export interface SongMeta {
	userId: string
	title?: string
	description?: string
	collection?: string
	basedOn?: string
	createdAt?: string
	updatedAt?: string
}

export interface SongProperties {
	bpm: number
	swing?: number
	swingSubdivision?: Subdivision
	timeSignature?: number
}

export interface Track {
	notes: TrackNote[]
	gain: number
	instrument: number
}

export interface Instrument {
	color: string
}

export interface SongData extends SongProperties {
	tracks: Track[]
	instruments?: Instrument[]
	keyboardSettings?: Partial<KeyboardSettings>
	trackSettings?: Partial<TrackSettings>
}

export interface Song {
	id: string
	meta: SongMeta
	data: SongData
}

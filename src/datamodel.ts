import { Subdivision } from 'tone/build/esm/core/type/Units'
import { ScaleHighlight, ToneColorType } from './utils/tone-colors'

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

export interface SongProperties {
	bpm: number
	swing?: number
	swingSubdivision?: Subdivision
	timeSignature?: number
}

export interface Song extends SongProperties {
	tracks: TrackNote[][]
}

export interface SongMeta {
	id: string
	title?: string
	description?: string
	collection?: string
	user?: string

	// stored as JSON
	song: Song
	keyboardSettings?: Partial<KeyboardSettings>
	trackSettings?: Partial<TrackSettings>
}

export interface Collection {
	id: string
	title: string
	description?: string
	user?: string
}

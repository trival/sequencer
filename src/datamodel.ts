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

export interface EditorSettings {
	pxPerBeat: number
	defaultNoteDuration: Subdivision
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
	timeSignature?: number
}

export interface Track {
	notes: TrackNote[]
	instrument: number
}

export enum ActiveColor {
	Red = 'red',
	Magenta = 'magenta',
	Blue = 'blue',
	Cyan = 'cyan',
	Green = 'green',
	Yellow = 'yellow',
}

export interface Instrument {
	color?: ActiveColor
	volume?: number
	attack?: number
	decay?: number
	sustain?: number
	release?: number
}

export interface Song extends SongProperties {
	tracks: Track[]
	instruments?: Instrument[]
}

export interface SongData {
	song: Song
	keyboardSettings?: Partial<KeyboardSettings>
	editorSettings?: Partial<EditorSettings>
}

export interface SongEntity {
	id: string
	meta: SongMeta
	data: SongData
}

import { Subdivision as ToneSubdivision } from 'tone/build/esm/core/type/Units'
import { z } from 'zod'
import { ScaleHighlight, ToneColorType } from './utils/tone-colors'

// === Basic types ===

export const subdivisionValues = [
	'0',
	'1m',
	'1n',
	'1n.',
	'2n',
	'2n.',
	'2t',
	'4n',
	'4n.',
	'4t',
	'8n',
	'8n.',
	'8t',
	'16n',
	'16n.',
	'16t',
	'32n',
	'32n.',
	'32t',
	'64n',
	'64n.',
	'64t',
] as const satisfies ToneSubdivision[]

const subdivisionSchema = z.enum(subdivisionValues)

export type Subdivision = z.infer<typeof subdivisionSchema>

// === Collection ===

export const collectionSchema = z.object({
	id: z.string(),
	userId: z.string(),
	title: z.string(),
	description: z.string().optional(),
})

export type Collection = z.infer<typeof collectionSchema>

// === Keyboard Settings ===

export const keyboardSettingsSchema = z.object({
	baseNote: z.coerce.number(),
	offsetX: z.coerce.number(),
	offsetY: z.coerce.number(),
	maxRows: z.coerce.number(),
	maxCols: z.coerce.number(),
	keyLength: z.coerce.number(),
	scaleHighlight: z.nativeEnum(ScaleHighlight),
	toneColorType: z.nativeEnum(ToneColorType),
})

export type KeyboardSettings = z.infer<typeof keyboardSettingsSchema>

export const defaultKeyboardSettings: KeyboardSettings = {
	baseNote: 48, // 'C3 midi number'
	offsetX: 0,
	offsetY: 0,
	maxCols: 12,
	maxRows: 12,
	keyLength: 58,
	scaleHighlight: ScaleHighlight.Major,
	toneColorType: ToneColorType.CircleOfFiths,
}

// === Editor Settings ===

export const editorSettingsSchema = z.object({
	pxPerBeat: z.coerce.number(),
	defaultNoteDuration: subdivisionSchema,
})

export type EditorSettings = z.infer<typeof editorSettingsSchema>

export const defaultEditorSettings: EditorSettings = {
	pxPerBeat: 100,
	defaultNoteDuration: '4n',
}

// === Song ===

export const songMetaSchema = z.object({
	userId: z.string(),
	title: z.string(),
	description: z.string().optional(),
	collection: z.string().optional(),
	basedOn: z.string().optional(),
	isPublic: z.boolean().optional(),
	updatedAt: z.date().optional(),
})

export type SongMeta = z.infer<typeof songMetaSchema>

export const trackNoteSchema = z.object({
	midiNotes: z.array(z.coerce.number()),
	duration: z.union([subdivisionSchema, z.array(subdivisionSchema)]),
})

export type TrackNote = z.infer<typeof trackNoteSchema>

export const trackSchema = z.object({
	notes: z.array(trackNoteSchema),
	instrument: z.coerce.number(),
})

export type Track = z.infer<typeof trackSchema>

export enum ActiveColor {
	Red = 'red',
	Magenta = 'magenta',
	Blue = 'blue',
	Cyan = 'cyan',
	Green = 'green',
	Yellow = 'yellow',
}

export const instrumentSchema = z
	.object({
		color: z.nativeEnum(ActiveColor),
		volume: z.coerce.number(),
		attack: z.coerce.number(),
		decay: z.coerce.number(),
		sustain: z.coerce.number(),
		release: z.coerce.number(),
	})
	.partial()

export type Instrument = z.infer<typeof instrumentSchema>

export const songPropertiesSchema = z.object({
	bpm: z.coerce.number(),
	swing: z.coerce.number().optional(),
	timeSignature: z.coerce.number().optional(),
})

export type SongProperties = z.infer<typeof songPropertiesSchema>

export const songSchema = songPropertiesSchema.merge(
	z.object({
		tracks: z.array(trackSchema),
		instruments: z.array(instrumentSchema).optional(),
	}),
)

export type Song = z.infer<typeof songSchema>

export const songDataSchema = z.object({
	song: songSchema,
	keyboardSettings: keyboardSettingsSchema.partial().optional(),
	editorSettings: editorSettingsSchema.partial().optional(),
})

export type SongData = z.infer<typeof songDataSchema>

export interface SongEntity {
	id: string
	timestamp: number
	meta: SongMeta
	data: SongData
}

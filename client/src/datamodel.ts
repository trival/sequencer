import { Subdivision as ToneSubdivision } from 'tone/build/esm/core/type/Units'
import { ScaleHighlight, ToneColorType } from './utils/tone-colors'
import { z } from 'zod'

export const collectionSchema = z.object({
	id: z.string(),
	userId: z.string(),
	title: z.string(),
	description: z.string().optional(),
})

export type Collection = z.infer<typeof collectionSchema>

export const keyboardSettingsSchema = z.object({
	baseNote: z.number(),
	offsetX: z.number(),
	offsetY: z.number(),
	maxRows: z.number(),
	maxCols: z.number(),
	keyLength: z.number(),
	scaleHighlight: z.nativeEnum(ScaleHighlight),
	toneColorType: z.nativeEnum(ToneColorType),
})

export type KeyboardSettings = z.infer<typeof keyboardSettingsSchema>

// export interface EditorSettings {
// 	pxPerBeat: number
// 	defaultNoteDuration: Subdivision
// }

const subdivisionValues = [
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

export const editorSettingsSchema = z.object({
	pxPerBeat: z.number(),
	defaultNoteDuration: subdivisionSchema,
})

export type EditorSettings = z.infer<typeof editorSettingsSchema>

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
	midiNotes: z.array(z.number()),
	duration: z.union([subdivisionSchema, z.array(subdivisionSchema)]),
})

export type TrackNote = z.infer<typeof trackNoteSchema>

export const trackSchema = z.object({
	notes: z.array(trackNoteSchema),
	instrument: z.number(),
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
		volume: z.number(),
		attack: z.number(),
		decay: z.number(),
		sustain: z.number(),
		release: z.number(),
	})
	.partial()

export type Instrument = z.infer<typeof instrumentSchema>

export const songPropertiesSchema = z.object({
	bpm: z.number(),
	swing: z.number().optional(),
	timeSignature: z.number().optional(),
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
	meta: SongMeta
	data: SongData
}

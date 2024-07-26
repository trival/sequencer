import { z } from 'zod'
import type { Opt } from '../../lib/types'

export const songInputSchema = z.object({
	id: z.string(),
	title: z.string().optional(),
	data: z.string().optional(),
	description: z.string().optional(),
	forkedFromId: z.string().optional(),
	isPublic: z.boolean().optional(),
	collectionId: z.string().optional(),
})

export type SongInput = z.infer<typeof songInputSchema>

export interface Song {
	id: string
	updatedAt: Date

	userId: string
	forkedFromId: Opt<string>

	title: string
	description: Opt<string>

	isPublic: boolean
	collectionId: Opt<string>

	data: string
}

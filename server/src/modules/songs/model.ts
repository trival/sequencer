import { z } from 'zod'
import type { Opt } from '../../lib/types'

export const songInputSchema = z.object({
	id: z.string(),
	data: z.string(),
	isPublic: z.boolean().optional(),
	collectionId: z.string().optional(),
})

export type SongInput = z.infer<typeof songInputSchema>

export interface Song {
	id: string
	updatedAt: Date

	userId: string
	forkedFromId: Opt<string>

	isPublic: boolean
	collectionId: Opt<string>

	data: string
}

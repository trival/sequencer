import type { Opt } from '../../lib/types'

export interface Song {
	id: string
	updatedAt: Date

	userId: string
	forkedFromId: Opt<string>

	isPublic: boolean
	collectionId: Opt<string>

	data: string
}

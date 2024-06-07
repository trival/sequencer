export interface Song {
	id: string
	updatedAt: Date

	userId: string
	collectionId: string

	isPublic: boolean

	data: string
}

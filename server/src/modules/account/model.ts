export interface Profile {
	id: string
	createdAt: number
	username: string

	isPublic: boolean
	color: string
}

export interface Account extends Profile {
	passwordHash: string
}

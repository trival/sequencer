export interface Profile {
	id: string
	username: string

	isPublic: boolean
	color: string
}

export interface Account extends Profile {
	passwordHash: string
}

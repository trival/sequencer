export interface PublicProfile {
	id: string
	createdAt: number
	username: string
	color: string
}

export interface Profile extends PublicProfile {
	email: string
	isPublic: boolean
}

export interface Account extends Profile {
	passwordHash: string
}

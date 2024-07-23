export interface PublicProfile {
	id: string
	username: string
	color: string
}

export interface Profile extends PublicProfile {
	createdAt: Date
	email: string
	isPublic: boolean
}

export interface Account extends Profile {
	passwordHash: string
}

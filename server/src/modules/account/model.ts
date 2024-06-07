export interface Profile {
	userId: string
	username: string

	isPublic: boolean
	color: string
}

export interface Account extends Profile {
	password: string
}

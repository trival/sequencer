export interface Session {
	userId: () => string | null
	logout: () => void
}

export function createLocalSession(): Session {
	return {
		userId: () => null,
		logout: () => {},
	}
}

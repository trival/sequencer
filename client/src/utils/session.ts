import { createSignal } from 'solid-js'
import { Profile as ApiProfile } from '../../../server/src/modules/account/model'
import { TrpcClient } from './trpc'

export interface PublicProfile {
	userId: string
	username: string
	color: string
}

export interface Profile extends PublicProfile {
	email: string
	activeSince: Date
	isPublic: boolean
}

export interface Session {
	profile: () => Profile | null
	login: (username: string, password: string) => Promise<void>
	logout: () => Promise<void>
	register: (username: string, password: string, email: string) => Promise<void>

	// TODO
	// updateProfile: (profile: Partial<Profile>) => Promise<void>
	// deleteProfile: (password: string) => Promise<void>
}

export function createTrpcSession(client: TrpcClient): Session {
	const [profile, setProfile] = createSignal<Profile | null>(null)

	async function queryProfile() {
		const res = await client.account.profile.query()
		if (res) {
			setProfile(mapApiProfileToLocal(res as ApiProfile))
		}
	}

	queryProfile().catch(console.error)

	const session = {
		profile,
	} as Session

	session.login = async (username, password) => {
		console.log('session login', username)
		await client.account.login.mutate({ username, password })
		await queryProfile()
	}

	session.logout = async () => {
		await client.account.logout.mutate()
		setProfile(null)
	}

	session.register = async (username, password, email) => {
		console.log('session register', username)
		await client.account.register.mutate({ username, password, email })
		await queryProfile()
	}

	return session
}

function mapApiProfileToLocal(profile: ApiProfile): Profile {
	return {
		userId: profile.id,
		username: profile.username,
		email: profile.email,
		activeSince: profile.createdAt,
		isPublic: profile.isPublic,
		color: profile.color,
	}
}

export function createDummySession(): Session {
	return {
		profile: () => null,
		login: async () => {},
		logout: async () => {},
		register: async () => {},
	}
}

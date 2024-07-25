import { apiError } from '../../lib/errors'
import type { Session } from '../../lib/session'
import type { Opt } from '../../lib/types'
import type { Account, Profile, PublicProfile } from './model'
import type { AccountRepository } from './repo'

export interface RegisterInput {
	email: string
	username: string
	password: string
}

export interface AccountService {
	register: (session: Session, input: RegisterInput) => Promise<void>
	login: (session: Session, username: string, password: string) => Promise<void>
	logout: (session: Session) => Promise<void>

	profile: (
		session: Session,
		userId?: string,
	) => Promise<Opt<Profile | PublicProfile>>
	update: (session: Session, profile: Partial<Profile>) => Promise<void>
	delete: (session: Session, password: string) => Promise<void>
}

function randomColor() {
	const randomHex = () =>
		Math.floor(Math.random() * 256)
			.toString(16)
			.padStart(2, '0')
	return '#' + randomHex() + randomHex() + randomHex()
}

export const createAccountService = (
	repo: AccountRepository,
): AccountService => {
	const service = {} as AccountService

	service.register = async (session, input) => {
		if (await repo.byUsername(input.username)) {
			throw apiError('CONFLICT', 'Account already exists')
		}
		if (await repo.byEmail(input.email)) {
			throw apiError('CONFLICT', 'Account already exists')
		}

		const account: Account = {
			id: crypto.randomUUID(),
			createdAt: new Date(),
			username: input.username,
			email: input.email,
			passwordHash: await Bun.password.hash(input.password),
			isPublic: true,
			color: randomColor(),
		}

		await repo.save(account)

		await session.saveUser(account.id)
	}

	service.login = async (session, username, password) => {
		const account = await repo.byUsername(username)
		if (!account) {
			throw apiError('UNAUTHORIZED', 'Invalid username or password')
		}

		const valid = await Bun.password.verify(password, account.passwordHash)
		if (!valid) {
			throw apiError('UNAUTHORIZED', 'Invalid username or password')
		}

		await session.saveUser(account.id)
	}

	service.logout = async (session) => {
		await session.reset()
	}

	service.profile = async (session, userId) => {
		const id = userId ?? session.userId
		if (!id) {
			return null
		}

		const account = await repo.byId(id)
		if (!account) {
			return null
		}

		if (userId && userId !== session.userId) {
			if (!account.isPublic) {
				return null
			}
			return {
				id: account.id,
				username: account.username,
				color: account.color,
			} satisfies PublicProfile
		}

		return {
			id: account.id,
			email: account.email,
			createdAt: account.createdAt,
			username: account.username,
			isPublic: account.isPublic,
			color: account.color,
		} satisfies Profile
	}

	service.update = async (session, profile) => {
		if (!session.userId) {
			throw apiError('UNAUTHORIZED')
		}

		const account = await repo.byId(session.userId)

		if (!account) {
			throw apiError('NOT_FOUND')
		}

		if (profile.username) {
			const existingAccount = await repo.byUsername(profile.username)
			if (existingAccount && existingAccount.id !== account.id) {
				throw apiError('CONFLICT', 'Username already exists')
			}
		}

		if (profile.email) {
			const existingAccount = await repo.byEmail(profile.email)
			if (existingAccount && existingAccount.id !== account.id) {
				throw apiError('CONFLICT', 'Email already exists')
			}
		}

		const updated: Partial<Account> = {
			email: profile.email ?? account.email,
			username: profile.username ?? account.username,
			isPublic: profile.isPublic ?? account.isPublic,
			color: profile.color ?? account.color,
		}

		await repo.save({ ...account, ...updated })
	}

	service.delete = async (session, password) => {
		if (!session.userId) {
			throw apiError('UNAUTHORIZED')
		}

		const account = await repo.byId(session.userId)
		if (!account) {
			throw apiError('NOT_FOUND')
		}

		const valid = await Bun.password.verify(password, account.passwordHash)
		if (!valid) {
			throw apiError('UNAUTHORIZED', 'Invalid password')
		}

		await repo.delete(session.userId)

		await session.reset()
	}

	return service
}

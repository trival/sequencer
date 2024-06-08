import { eq, sql } from 'drizzle-orm'
import type { Db } from '../../db/db'
import { users, type UserDb } from '../../db/schema/users'
import { apiError } from '../../lib/errors'
import type { Opt } from '../../lib/types'
import { changes } from '../../lib/utils'
import type { Account } from './model'

export interface AccountRepository {
	byId: (id: string) => Promise<Account>
	byUsername: (username: string) => Promise<Opt<Account>>

	save: (account: Account) => Promise<void>
	delete: (id: string) => Promise<void>
}

export const createAccountDbRepository = (db: Db): AccountRepository => {
	const byIdQuery = db.query.users
		.findFirst({
			where: eq(users.id, sql.placeholder('id')),
		})
		.prepare()

	const byUsernameQuery = db.query.users
		.findFirst({
			where: eq(users.username, sql.placeholder('username')),
		})
		.prepare()

	const deleteQuery = db
		.delete(users)
		.where(eq(users.id, sql.placeholder('id')))
		.prepare()

	const repo = {} as AccountRepository

	repo.byId = async (id) => {
		const res = await byIdQuery.execute({ id })
		if (!res) {
			throw apiError('NOT_FOUND', 'User not found')
		}
		return userDbToData(res)
	}

	repo.byUsername = async (username) => {
		const res = await byUsernameQuery.execute({ username })
		return res ? userDbToData(res) : null
	}

	repo.save = async (account) => {
		const res = await byIdQuery.execute({ id: account.id })
		if (!res) {
			await db.insert(users).values(userDataToDb(account)).execute()
		} else {
			const old = userDbToData(res)
			const diff = changes(old, account, ['id'])
			await db
				.update(users)
				.set(userDiffToDb(diff))
				.where(eq(users.id, account.id))
				.execute()
		}
	}

	repo.delete = async (id) => {
		await deleteQuery.execute({ id })
	}

	return repo
}

// mappers

const userDbToData = (user: UserDb): Account => {
	return {
		id: user.id,
		username: user.username,
		passwordHash: user.password,
		isPublic: !!user.isPublic,
		color: user.color ?? '',
	}
}

const userDataToDb = (user: Account): UserDb => {
	return {
		id: user.id,
		username: user.username,
		password: user.passwordHash,
		isPublic: !!user.isPublic,
		color: user.color,
	}
}

const userDiffToDb = (diff: Partial<Account>): Partial<UserDb> => {
	const res: Partial<UserDb> = {}

	if ('username' in diff) res.username = diff.username
	if ('passwordHash' in diff) res.password = diff.passwordHash
	if ('isPublic' in diff) res.isPublic = diff.isPublic
	if ('color' in diff) res.color = diff.color

	return res
}
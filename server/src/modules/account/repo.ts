import { eq, sql } from 'drizzle-orm'
import type { Db } from '../../db/db'
import { user, type UserDb, type UserDbInsert } from '../../db/schema/user'
import type { Opt } from '../../lib/types'
import { changes } from '../../lib/utils'
import type { Account } from './model'

export interface AccountRepository {
	byId: (id: string) => Promise<Opt<Account>>
	byUsername: (username: string) => Promise<Opt<Account>>
	byEmail: (email: string) => Promise<Opt<Account>>

	save: (account: Account) => Promise<void>
	delete: (id: string) => Promise<void>
}

export const createAccountDbRepository = (db: Db): AccountRepository => {
	const byIdQuery = db.query.user
		.findFirst({
			where: eq(user.id, sql.placeholder('id')),
		})
		.prepare()

	const byUsernameQuery = db.query.user
		.findFirst({
			where: eq(user.username, sql.placeholder('username')),
		})
		.prepare()

	const byEmailQuery = db.query.user
		.findFirst({
			where: eq(user.email, sql.placeholder('email')),
		})
		.prepare()

	const deleteQuery = db
		.delete(user)
		.where(eq(user.id, sql.placeholder('id')))
		.prepare()

	const repo = {} as AccountRepository

	repo.byId = async (id) => {
		const res = await byIdQuery.execute({ id })
		return res ? userDbToData(res) : null
	}

	repo.byUsername = async (username) => {
		const res = await byUsernameQuery.execute({ username })
		return res ? userDbToData(res) : null
	}

	repo.byEmail = async (email) => {
		const res = await byEmailQuery.execute({ email })
		return res ? userDbToData(res) : null
	}

	repo.save = async (account) => {
		const res = await byIdQuery.execute({ id: account.id })
		if (!res) {
			await db.insert(user).values(userDataToDb(account)).execute()
		} else {
			const old = userDbToData(res)
			const diff = changes(old, account, ['id'])
			await db
				.update(user)
				.set(userDiffToDb(diff))
				.where(eq(user.id, account.id))
				.execute()
		}
	}

	repo.delete = async (id) => {
		await deleteQuery.execute({ id })
	}

	return repo
}

// mappers

function userDbToData(user: UserDb): Account {
	return {
		id: user.id,
		createdAt: user.createdAt,
		username: user.username,
		email: user.email,
		passwordHash: user.passwordHash,
		isPublic: !!user.isPublic,
		color: user.color ?? '',
	}
}

function userDataToDb(user: Account): UserDbInsert {
	return {
		id: user.id,
		createdAt: user.createdAt,
		username: user.username,
		email: user.email,
		passwordHash: user.passwordHash,
		isPublic: user.isPublic,
		color: user.color,
	}
}

function userDiffToDb(diff: Partial<Account>): Partial<UserDb> {
	const res: Partial<UserDb> = {}

	if ('username' in diff) res.username = diff.username
	if ('email' in diff) res.email = diff.email
	if ('passwordHash' in diff) res.passwordHash = diff.passwordHash
	if ('isPublic' in diff) res.isPublic = diff.isPublic
	if ('color' in diff) res.color = diff.color

	return res
}

import { Database } from 'bun:sqlite'
import { afterEach, describe, expect, it } from 'bun:test'
import { checkErrorCode } from '../../../test/lib/utils'
import { getDb, setupAndMigrateDb } from '../../db/db'
import { user } from '../../db/schema/user'
import type { Account } from './model'
import { createAccountDbRepository } from './repo'

describe('AccountRepo', () => {
	const db = getDb(new Database(':memory:'))
	setupAndMigrateDb(db)

	const repo = createAccountDbRepository(db)

	afterEach(async () => {
		await db.delete(user).execute()
	})

	it('can save and retrieve an account', async () => {
		const a1: Account = {
			id: '1',
			createdAt: new Date(),
			email: 'foo@bar.de',
			username: 'test',
			passwordHash: 'abc',
			isPublic: true,
			color: 'red',
		}

		await repo.save(a1)

		const res1 = await repo.byId('1')

		expect(res1).toEqual(a1)

		const a2: Account = {
			id: '1',
			createdAt: new Date(),
			email: 'fuu@bar.de',
			username: 'test2',
			passwordHash: 'xyz',
			isPublic: false,
			color: 'blue',
		}

		await repo.save(a2)

		const res2 = await repo.byId('1')

		expect(res2).toEqual(a2)

		const res3 = await repo.byUsername('test2')

		expect(res3).toEqual(a2)

		const res4 = await repo.byUsername('test')

		expect(res4).toBeNull()

		const a3: Account = {
			id: '2',
			createdAt: new Date(),
			email: 'foo@baz.de',
			username: 'test',
			passwordHash: 'abc',
			isPublic: true,
			color: 'red',
		}

		await repo.save(a3)

		const res5 = await repo.byId('2')

		expect(res5).toEqual(a3)

		await repo.delete('1')

		await checkErrorCode('NOT_FOUND', () => repo.byId('1'))
	})
})

import { beforeEach, describe, expect, it } from 'vitest'
import { checkErrorCode } from '../../../test/lib/utils'
import { getDb } from '../../db/db'
import { uuid, wait } from '../../lib/utils'
import type { Account } from '../account/model'
import { createAccountDbRepository } from '../account/repo'
import { createSongDbRepository } from './repo'
import { createSongService, type SongService } from './service'
import type { Session } from '../../context'
import type { SongInput } from './model'
import { env } from 'cloudflare:test'

const makeSong = (song?: Partial<SongInput>): SongInput =>
	({
		id: uuid(),
		data: 'data',
		title: 'title',
		...song,
	}) as SongInput

describe('song service', () => {
	let service: SongService

	const userId1 = uuid()
	const userId2 = uuid()

	const user1: Account = {
		id: userId1,
		createdAt: new Date(),
		email: 'test1@test.com',
		isPublic: true,
		passwordHash: 'hash',
		username: 'test1',
		color: 'red',
	}

	const user2: Account = {
		id: userId2,
		createdAt: new Date(),
		email: 'test2@test.com',
		isPublic: false,
		passwordHash: 'hash',
		username: 'test2',
		color: 'blue',
	}

	const ses1 = { userId: userId1 } as Session
	const ses2 = { userId: userId2 } as Session
	const sesX = {} as Session

	beforeEach(async () => {
		const db = getDb(env.DB, { debug: false })
		const repo = createSongDbRepository(db)
		const userRepo = createAccountDbRepository(db)

		service = createSongService(repo)
		await userRepo.save(user1)
		await userRepo.save(user2)
	})

	it('should save a song', async () => {
		const songData = makeSong()
		const id = songData.id

		await checkErrorCode('UNAUTHORIZED', () => service.save(sesX, songData))

		const res1 = await service.save(ses1, songData)

		expect(res1).toMatchObject({
			...songData,
			userId: userId1,
			isPublic: true,
		})

		const res2 = await service.save(ses2, songData)

		expect(res2).toMatchObject({
			userId: userId2,
			isPublic: true,
			forkedFromId: id,
			data: songData.data,
		})

		expect(res2.id).not.toEqual(id)

		await wait(2)

		const res3 = await service.save(ses1, songData)

		expect(res3).toEqual(res1)

		await wait(2)

		const res4 = await service.save(ses1, { ...songData, isPublic: false })

		expect({ ...res4 }).toMatchObject({
			...res3,
			isPublic: false,
			updatedAt: expect.any(Date),
		})

		expect(res4.updatedAt > res3.updatedAt).toBe(true)
	})

	it('should respect song visibility', async () => {
		const s1 = await service.save(
			ses1,
			makeSong({
				data: 'data1',
				isPublic: false,
			}),
		)
		await wait(2)
		const s2 = await service.save(ses2, makeSong({ data: 'data2' }))
		await wait(2)
		const s3 = await service.save(ses1, makeSong({ data: 'data3' }))

		let res1 = await service.byId(ses1, s1.id)
		expect(res1).toEqual(s1)

		res1 = await service.byId(ses2, s1.id)
		expect(res1).toBeNull()

		res1 = await service.byId(ses2, s2.id)
		expect(res1).toEqual(s2)

		res1 = await service.byId(ses1, s2.id)
		expect(res1).toBeNull()

		res1 = await service.byId(sesX, s2.id)
		expect(res1).toBeNull()

		res1 = await service.byId(sesX, s1.id)
		expect(res1).toBeNull()

		let res2 = await service.listByLatest(ses1, {})
		expect(res2.list).toEqual([s3, s1])

		res2 = await service.listByLatest(ses2, {})
		expect(res2.list).toEqual([s3, s2])

		res2 = await service.listByLatest(sesX, {})
		expect(res2.list).toEqual([s3])

		res2 = await service.listByUser(ses1, userId1, {})
		expect(res2.list).toEqual([s3, s1])

		res2 = await service.listByUser(ses2, userId1, {})
		expect(res2.list).toEqual([s3])

		res2 = await service.listByUser(ses1, userId2, {})
		expect(res2.list).toEqual([])

		res2 = await service.listByUser(ses2, userId2, {})
		expect(res2.list).toEqual([s2])

		res2 = await service.listByUser(sesX, userId1, {})
		expect(res2.list).toEqual([s3])

		res2 = await service.listByUser(sesX, userId2, {})
		expect(res2.list).toEqual([])

		// TODO: test listByCollection
	})

	it('can delete a song', async () => {
		const s1 = await service.save(ses1, makeSong())
		const s2 = await service.save(ses2, makeSong())

		await checkErrorCode('UNAUTHORIZED', () => service.delete(sesX, s1.id))
		await checkErrorCode('UNAUTHORIZED', () => service.delete(ses2, s1.id))

		await service.delete(ses1, s1.id)

		let res = await service.byId(ses1, s1.id)
		expect(res).toBeNull()

		res = await service.byId(ses2, s1.id)
		expect(res).toBeNull()

		res = await service.byId(ses2, s2.id)
		expect(res).toEqual(s2)

		await service.delete(ses1, s1.id)
	})
})

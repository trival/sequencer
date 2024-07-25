import { beforeAll, describe, expect, it } from 'bun:test'
import type { Profile } from '../../src/modules/account/model'
import { getTrpcClient } from '../lib/trpcClient'

describe('account api', () => {
	const { client, resetTestServer } = getTrpcClient()
	const { client: client2 } = getTrpcClient()

	beforeAll(async () => {
		await resetTestServer()
	})

	it('should create and query an account', async () => {
		let profile = await client.account.profile.query({})
		expect(profile).toBe(null)

		const before = new Date()
		await client.account.register.mutate({
			email: 'foo@bar.de',
			password: 'password',
			username: 'foo',
		})
		const after = new Date()

		profile = await client.account.profile.query({})
		const p = profile as Profile

		expect(p).toMatchObject({
			username: 'foo',
			email: 'foo@bar.de',
		})
		expect(p.createdAt >= before).toBeTrue()
		expect(p.createdAt <= after).toBeTrue()
		expect(p.isPublic).toBeTrue()
		expect(p.color).toMatch(/^#[0-9a-f]{6}$/)
		expect(p.id).toBeString()

		profile = await client2.account.profile.query({ userId: p.id })

		expect(profile).toEqual({
			id: p.id,
			color: p.color,
			username: 'foo',
		})

		await client.account.update.mutate({
			color: '#123456',
			isPublic: false,
			username: 'bar',
			email: 'bar@bar.de',
		})

		profile = await client2.account.profile.query({ userId: p.id })

		expect(profile).toBeNull()

		profile = await client.account.profile.query()
		const p2 = profile as Profile

		expect(p2).toEqual({
			id: p.id,
			createdAt: p.createdAt,
			username: 'bar',
			email: 'bar@bar.de',
			isPublic: false,
			color: '#123456',
		})

		await client.account.update.mutate({
			isPublic: true,
		})

		profile = await client2.account.profile.query({ userId: p.id })

		expect(profile).toEqual({
			id: p.id,
			color: '#123456',
			username: 'bar',
		})

		await client2.account.login.mutate({
			password: 'password',
			username: 'bar',
		})

		profile = await client2.account.profile.query({ userId: p.id })

		expect(profile).toEqual({ ...p2, isPublic: true })

		profile = await client2.account.profile.query()

		expect(profile).toEqual({ ...p2, isPublic: true })

		await client2.account.logout.mutate()

		profile = await client2.account.profile.query({ userId: p.id })

		expect(profile).toEqual({
			id: p.id,
			color: '#123456',
			username: 'bar',
		})

		profile = await client2.account.profile.query()

		expect(profile).toBeNull()

		await client.account.delete.mutate({ password: 'password' })

		profile = await client.account.profile.query()

		expect(profile).toBeNull()

		profile = await client2.account.profile.query({ userId: p.id })

		expect(profile).toBeNull()
	})
})

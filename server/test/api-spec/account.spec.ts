import { describe, it, expect, beforeAll } from 'bun:test'
import { getTrpcClient } from '../lib/trpcClient'

describe('account api', () => {
	const { client, resetTestServer } = getTrpcClient()
	beforeAll(async () => {
		await resetTestServer()
	})

	it('should create an account', async () => {
		const data = await client.account.register.mutate({
			email: 'foo@bar.de',
			password: 'password',
			username: 'foo',
		})

		console.log(data)

		const profile = await client.account.profile.query({})

		console.log(profile)
	})
})

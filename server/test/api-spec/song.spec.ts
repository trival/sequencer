import { describe, it, expect } from 'vitest'
import { getTrpcClient } from '../lib/trpcClient'
import { uuid } from '../../src/lib/utils'

describe('song api', () => {
	const { client } = getTrpcClient()
	// const { client: client2 } = getTrpcClient()

	it('should create and query a song', async () => {
		await client.account.register.mutate({
			email: 'test@test.de',
			password: 'password',
			username: 'test',
		})

		const profile = await client.account.profile.query()
		const uid = profile!.id

		const id = uuid()

		const now = new Date()

		const song = await client.song.save.mutate({
			song: {
				id,
				data: 'song data',
				title: 'song title',
			},
		})

		expect(song).toMatchObject({
			id,
			userId: uid,
			isPublic: true,
			data: 'song data',
		})
		expect(song.updatedAt >= now).toBe(true)
	})
})

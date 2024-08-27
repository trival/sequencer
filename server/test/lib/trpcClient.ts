import { createTRPCClient, httpBatchLink, type HTTPHeaders } from '@trpc/client'
import { SELF } from 'cloudflare:test'
import SuperJSON from 'superjson'
import type { TrpcSchema } from '../../src/trpc-router'

export const getTrpcClient = ({ baseUrl }: { baseUrl?: string } = {}) => {
	const url = baseUrl || `https://example.com`

	console.log('Using trpc base url:', url)

	let sid = ''

	const client = createTRPCClient<TrpcSchema>({
		links: [
			httpBatchLink({
				url: url + '/trpc',
				transformer: SuperJSON,

				headers() {
					// set session id cookie
					const headers: HTTPHeaders = {}
					if (sid) {
						headers.cookie = `sid=${sid}`
					}
					return headers
				},

				async fetch(input, init) {
					const res = await SELF.fetch(input, init)
					// extract session id cookie
					const cookie = res.headers.get('set-cookie')
					if (cookie) {
						const match = cookie.match(/sid=([^;]+)/)
						if (match) {
							sid = match[1]
						}
					}
					return res
				},
			}),
		],
	})

	return {
		client,
		baseUrl: url,
	}
}

import { createTRPCClient, httpBatchLink, type HTTPHeaders } from '@trpc/client'
import type { TrpcSchema } from '../../src/trpc-router'
import * as config from '../../src/config'
import SuperJSON from 'superjson'

export const getTrpcClient = ({ baseUrl }: { baseUrl?: string } = {}) => {
	const url = baseUrl || `http://localhost:${config.port}`

	console.log('Using trpc base url:', url)

	function resetTestServer() {
		return fetch(`${url}/reset`, {
			method: 'POST',
		})
	}

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
						headers.cookie = `connect.sid=${sid}`
					}
					return headers
				},

				fetch(input, init) {
					return fetch(input, init).then((res) => {
						// extract session id cookie
						const cookie = res.headers.get('set-cookie')
						if (cookie) {
							const match = cookie.match(/connect\.sid=([^;]+)/)
							if (match) {
								sid = match[1]
							}
						}

						return res
					})
				},
			}),
		],
	})

	return {
		client,
		baseUrl: url,
		resetTestServer,
	}
}

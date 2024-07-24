import { createTRPCClient, httpBatchLink, type HTTPHeaders } from '@trpc/client'
import type { TrpcRouter } from '../../src/trpc-router'
import * as config from '../../src/config'

export const getTrpcClient = ({ baseUrl }: { baseUrl?: string } = {}) => {
	let sid = ''

	const url = baseUrl || `http://localhost:${config.port}`

	console.log('Using trpc base url:', url)

	function resetTestServer() {
		return fetch(`${url}/reset`, {
			method: 'POST',
		})
	}

	const client = createTRPCClient<TrpcRouter>({
		links: [
			httpBatchLink({
				url: url + '/trpc',

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

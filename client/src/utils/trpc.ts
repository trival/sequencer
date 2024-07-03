import { createTRPCClient, unstable_httpBatchStreamLink } from '@trpc/client'

import type { TrpcRouter } from '../../../server/src/trpc-router'

// Initialize the tRPC client
const trpc = createTRPCClient<TrpcRouter>({
	links: [
		unstable_httpBatchStreamLink({
			url: import.meta.env.VITE_TRPC_SERVER_URL + '/trpc',
		}),
	],
})

export function testServer() {
	trpc.test.query({ name: 'world' }).then((res) => {
		console.log(res)
	})
}

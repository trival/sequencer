import { createTRPCClient, httpBatchLink } from '@trpc/client'

import type { TrpcSchema } from '../../../server/src/trpc-router'
import SuperJSON from 'superjson'

// Initialize the tRPC client
export const createTrpc = () => {
	const serverUrl = import.meta.env.VITE_TRPC_DEV_SERVER_URL || '/api'
	return createTRPCClient<TrpcSchema>({
		links: [
			httpBatchLink({
				url: serverUrl + '/trpc',
				transformer: SuperJSON,
				fetch(input, init) {
					return fetch(input, {
						...init,
						credentials: 'include',
					})
				},
			}),
		],
	})
}

export type TrpcClient = ReturnType<typeof createTrpc>

import { createTRPCClient, httpBatchLink } from '@trpc/client'

import type { TrpcSchema } from '../../../server/src/trpc-router'
import SuperJSON from 'superjson'

// Initialize the tRPC client
export const createTrpc = () =>
	createTRPCClient<TrpcSchema>({
		links: [
			httpBatchLink({
				url: import.meta.env.VITE_TRPC_SERVER_URL + '/trpc',
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

export type TrpcClient = ReturnType<typeof createTrpc>

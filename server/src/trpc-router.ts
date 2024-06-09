import { trpc } from './lib/trpc'
import { accountRouter } from './modules/account/router'

export const trpcRouter = trpc.router({
	account: accountRouter,
})

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type TrpcRouter = typeof trpcRouter

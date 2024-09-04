import { trpc } from './lib/trpc'
import { accountRouter } from './modules/account/router'
import { songRouter } from './modules/songs/router'

export const trpcRouter = trpc.router({
	account: accountRouter,
	song: songRouter,
})

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type TrpcSchema = typeof trpcRouter

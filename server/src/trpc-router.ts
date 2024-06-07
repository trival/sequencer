import { initTRPC } from '@trpc/server'
import type { Session } from 'express-session'
import { z } from 'zod'
import type { AccountService } from './modules/account/service'

export interface Context {
	session: Session
	services: {
		account: AccountService
	}
}

const t = initTRPC.context<Context>().create()

export const trpcRouter = t.router({
	greeting: t.procedure
		// This is the input schema of your procedure
		// 💡 Tip: Try changing this and see type errors on the client straight away
		.input(
			z
				.object({
					name: z.string().nullish(),
				})
				.nullish(),
		)
		.query(({ input, ctx }) => {
			// This is what you're returning to your client
			return {
				text: `hello ${input?.name ?? 'world'}`,
				// 💡 Tip: Try adding a new property here and see it propagate to the client straight-away
			}
		}),
})

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type TrpcRouter = typeof trpcRouter

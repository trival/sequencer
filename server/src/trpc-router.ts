import { z } from 'zod'
import { trpc } from './lib/trpc'
import { accountRouter } from './modules/account/router'

export const trpcRouter = trpc.router({
	test: trpc.procedure
		.input(
			z.object({
				name: z.string().min(3),
			}),
		)
		.query(
			({ input, ctx }) =>
				`Hello, ${input.name}! Your session ID is ${ctx.session.id}`,
		),
	account: accountRouter,
})

// export only the type definition of the API
// None of the actual implementation is exposed to the client
export type TrpcRouter = typeof trpcRouter

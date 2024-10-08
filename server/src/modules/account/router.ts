import { z } from 'zod'
import { trpc } from '../../lib/trpc'
import { profileUpdateInputSchema, registerInputSchema } from './model'

export const accountRouter = trpc.router({
	register: trpc.procedure
		.input(registerInputSchema)
		.mutation(({ input, ctx }) =>
			ctx.services.account.register(ctx.session, input),
		),

	login: trpc.procedure
		.input(
			z.object({
				username: z.string().min(1),
				password: z.string().min(1),
			}),
		)
		.mutation(({ input, ctx }) =>
			ctx.services.account.login(ctx.session, input.username, input.password),
		),

	logout: trpc.procedure.mutation(({ ctx }) =>
		ctx.services.account.logout(ctx.session),
	),

	profile: trpc.procedure
		.input(
			z
				.object({
					userId: z.string().optional(),
				})
				.optional(),
		)
		.query(({ input, ctx }) =>
			ctx.services.account.profile(ctx.session, input?.userId),
		),

	update: trpc.procedure
		.input(profileUpdateInputSchema)
		.mutation(({ input, ctx }) =>
			ctx.services.account.update(ctx.session, input),
		),

	delete: trpc.procedure
		.input(z.object({ password: z.string().min(1) }))
		.mutation(({ input, ctx }) =>
			ctx.services.account.delete(ctx.session, input.password),
		),
})

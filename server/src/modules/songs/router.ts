import { z } from 'zod'
import { trpc } from '../../lib/trpc'
import { songInputSchema } from './model'

export const songRouter = trpc.router({
	byId: trpc.procedure
		.input(z.object({ id: z.string() }))
		.query(({ input, ctx }) => ctx.services.song.byId(ctx.session, input.id)),

	listByUser: trpc.procedure
		.input(
			z.object({
				userId: z.string(),
				pagination: z
					.object({
						limit: z.number().optional(),
						offset: z.number().optional(),
					})
					.optional(),
			}),
		)
		.query(({ input, ctx }) =>
			ctx.services.song.listByUser(ctx.session, input.userId, input.pagination),
		),

	listByCollection: trpc.procedure
		.input(
			z.object({
				collectionId: z.string(),
				pagination: z
					.object({
						limit: z.number().optional(),
						offset: z.number().optional(),
					})
					.optional(),
			}),
		)
		.query(({ input, ctx }) =>
			ctx.services.song.listByCollection(
				ctx.session,
				input.collectionId,
				input.pagination,
			),
		),

	listByLatest: trpc.procedure
		.input(
			z.object({
				pagination: z
					.object({
						limit: z.number().optional(),
						offset: z.number().optional(),
					})
					.optional(),
			}),
		)
		.query(({ input, ctx }) =>
			ctx.services.song.listByLatest(ctx.session, input.pagination),
		),

	save: trpc.procedure
		.input(z.object({ song: songInputSchema }))
		.mutation(({ input, ctx }) =>
			ctx.services.song.save(ctx.session, input.song),
		),

	delete: trpc.procedure
		.input(z.object({ id: z.string() }))
		.mutation(({ input, ctx }) =>
			ctx.services.song.delete(ctx.session, input.id),
		),
})

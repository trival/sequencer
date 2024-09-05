import { initTRPC } from '@trpc/server'
import type { Services, Session } from '../context'
import SuperJSON from 'superjson'

export interface Context {
	session: Session
	services: Services
	isProduction: boolean
}

export const trpc = initTRPC.context<Context>().create({
	transformer: SuperJSON,
	errorFormatter: ({ error, ctx, shape }) => {
		return {
			...shape,
			data: {
				...shape.data,
				stack: ctx?.isProduction ? undefined : error.stack,
			},
		}
	},
})

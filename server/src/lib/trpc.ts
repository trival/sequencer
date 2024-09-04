import { initTRPC } from '@trpc/server'
import type { Services, Session } from '../context'
import SuperJSON from 'superjson'

export interface Context {
	session: Session
	services: Services
}

export const trpc = initTRPC.context<Context>().create({
	transformer: SuperJSON,
})

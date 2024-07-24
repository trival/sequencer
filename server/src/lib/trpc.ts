import { initTRPC } from '@trpc/server'
import type { Session } from './session'
import type { Services } from '../context'

export interface Context {
	session: Session
	services: Services
}

export const trpc = initTRPC.context<Context>().create()

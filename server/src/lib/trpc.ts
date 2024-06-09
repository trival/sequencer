import { initTRPC } from '@trpc/server'
import type { Session } from './session'
import type { AccountService } from '../modules/account/service'

export interface Context {
	session: Session
	services: {
		account: AccountService
	}
}

export const trpc = initTRPC.context<Context>().create()

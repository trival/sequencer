import { TRPCError } from '@trpc/server'
import type { Opt } from '../../lib/types'
import type { Account } from './model'

export interface AccountRepository {
	byId: (id: string) => Promise<Account>
	byUsername: (username: string) => Promise<Opt<Account>>
	byEmail: (email: string) => Promise<Opt<Account>>

	save: (account: Account) => Promise<void>
	delete: (id: string) => Promise<void>
}

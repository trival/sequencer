import type { Session } from 'express-session'
import type { Opt } from '../../lib/types'
import type { Profile } from './model'

export interface AccountService {
	register: (
		session: Session,
		username: string,
		password: string,
	) => Promise<void>
	login: (session: Session, username: string, password: string) => Promise<void>
	logout: (session: Session) => Promise<void>
	profile: (session: Session, userId?: string) => Promise<Opt<Profile>>
	updateProfile: (profile: Partial<Profile>) => Promise<void>
}

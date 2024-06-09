import type { Session as ExpressSession, SessionData } from 'express-session'

declare module 'express-session' {
	interface SessionData {
		userId?: string | null
	}
}

export type Session = ExpressSession & SessionData

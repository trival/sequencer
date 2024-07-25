import type { Request } from 'express'
import { apiError } from './errors'
import type { Session } from '../context'

declare module 'express-session' {
	interface SessionData {
		userId?: string | null
	}
}

export function createSession(req: Request): Session {
	return {
		get userId() {
			return req.session.userId || null
		},

		saveUser(userId: string) {
			return new Promise<void>((resolve, reject) => {
				req.session.regenerate((err) => {
					if (err) {
						console.error('Failed to regenerate session', err)
						reject(apiError('INTERNAL_SERVER_ERROR'))
					}

					// store user information in session
					req.session.userId = userId

					req.session.save((err) => {
						if (err) {
							console.error('Failed to save session', err)
							reject(apiError('INTERNAL_SERVER_ERROR'))
						}

						console.log(
							'regenerated session',
							req.session.id,
							req.session.userId,
						)

						resolve()
					})
				})
			})
		},

		reset() {
			return new Promise((resolve, reject) => {
				req.session.userId = null

				req.session.save((err) => {
					if (err) {
						console.error('Failed to save session', err)
						reject(apiError('INTERNAL_SERVER_ERROR'))
					}

					req.session.regenerate((err) => {
						if (err) {
							console.error('Failed to regenerate session', err)
							reject(apiError('INTERNAL_SERVER_ERROR'))
						}

						resolve()
					})
				})
			})
		},
	}
}

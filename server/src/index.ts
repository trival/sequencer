import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import session, { type Session } from 'hono-session'
import type {} from 'hono-session/global'
import { cors } from 'hono/cors'
import * as config from './config'
import {
	createRepositories,
	createServices,
	type Session as LocalSession,
	type Services,
} from './context'
import { getDb } from './db/db'
import { trpcRouter } from './trpc-router'

function getServices(dbConnection: D1Database) {
	const db = getDb(dbConnection)
	const repos = createRepositories(db)
	return createServices(repos)
}

declare module 'hono-session' {
	export interface Session {
		userId?: string
	}
}

interface AppEnv {
	Variables: {
		session: Session
		localSession: LocalSession
		services: Services
	}
	Bindings: Env
}

function createServer() {
	// create context

	const app = new Hono<AppEnv>()

	app.use(async (c, next) => {
		c.set('services', getServices(c.env.DB))
		c.set('localSession', {
			get userId() {
				return c.session.userId || null
			},
			async saveUser(userId: string) {
				c.session.userId = userId
			},
			async reset() {
				c.session = null
			},
		} satisfies LocalSession)

		next()
	})

	app.use(
		session({
			secret: config.sessionSecret,
			cookieOptions: {
				secure: process.env.NODE_ENV === 'production',
			},
		}),
	)

	app.use(async (c, next) => {
		// request logger
		console.log('⬅️ ', c.req.method, c.req.path, c.req.parseBody(), c.req.query)
		next()
	})

	app.use('/reset', async (c) => {
		if (process.env.NODE_ENV !== 'test') {
			c.status(404)
			c.text('Not found')
			return
		}
		c.text('ok')
	})

	app.use(
		'/trpc/*',
		cors({
			origin: (origin) => {
				if (origin.endsWith('localhost:4000')) {
					return origin
				} else if (origin.endsWith('trival.xyz')) {
					return origin
				}
			},
			credentials: true,
		}),
		trpcServer({
			router: trpcRouter,
			createContext: (opts, c) => ({
				session: c.get('localSession'),
				services: c.get('services'),
			}),
		}),
	)

	app.get('/', (c) => {
		return c.text('trival sequencer api')
	})

	return {
		fetch: app.fetch,
		port: config.port,
	}
}

export default createServer()

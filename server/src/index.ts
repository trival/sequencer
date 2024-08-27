import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import session, { type Session } from 'hono-session'
import type {} from 'hono-session/global'
import { cors } from 'hono/cors'
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
		userId?: string | null
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

const app = new Hono<AppEnv>()

app.use(async (c, next) => {
	const s = session({
		secret: c.env.SESSION_SECRET,
		cookieOptions: {
			secure: c.env.NODE_ENV === 'production',
		},
	})

	return s(c as any, next)
})

app.use(async (c, next) => {
	c.set('services', getServices(c.env.DB))
	c.set('localSession', {
		get userId() {
			c.session.renew()
			return c.session.userId || null
		},
		async saveUser(userId: string) {
			c.session.userId = userId
		},
		async reset() {
			c.session.userId = null
			c.session.regenerate()
			c.session = null
		},
	} satisfies LocalSession)

	return next()
})

app.use(async (c, next) => {
	// request logger
	console.log(
		'⬅️ ',
		c.req.method,
		c.req.path,
		await c.req.parseBody(),
		c.req.query(),
	)
	return next()
})

app.use(
	'/trpc/*',
	cors({
		origin: (origin) => {
			if (origin.includes('//localhost:')) {
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

export default app

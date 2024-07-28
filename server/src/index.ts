import cors from 'cors'
import express from 'express'
import * as config from './config'
import { trpcRouter } from './trpc-router'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import session from 'express-session'
import { getDb, getDefaultConnection, setupAndMigrateDb } from './db/db'
import { createRepositories, createServices } from './context'
import { Database } from 'bun:sqlite'
import { createSession } from './lib/session'

let connection: Database

function getServices() {
	if (connection) {
		connection.close()
	}
	connection = getDefaultConnection()
	const db = getDb(connection)
	setupAndMigrateDb(db)
	const repos = createRepositories(db)
	return createServices(repos)
}

async function main() {
	// create context
	let services = getServices()

	// express implementation
	const app = express()

	app.use(
		session({
			secret: config.sessionSecret,
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: process.env.NODE_ENV === 'production',
			},
		}),
	)

	app.use((req, _res, next) => {
		// request logger
		console.log('⬅️ ', req.method, req.path, req.body ?? req.query)
		next()
	})

	app.use('/reset', async (_req, res) => {
		if (process.env.NODE_ENV !== 'test') {
			return res.status(404).send('Not found')
		}
		services = getServices()
		res.send('ok')
	})

	app.use(
		'/trpc',
		cors({
			origin: config.corsOrigin,
			credentials: true,
		}),
		createExpressMiddleware({
			router: trpcRouter,
			createContext: ({ req }) => ({
				session: createSession(req),
				services,
			}),
		}),
	)

	app.get('/', (_req, res) => res.send('trival sequencer api'))

	app.listen(config.port, () => {
		console.log(`listening on port ${config.port}`)
	})
}

void main()

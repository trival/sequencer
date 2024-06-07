import cors from 'cors'
import express from 'express'
import * as config from './config'
import { trpcRouter } from './trpc-router'
import { createExpressMiddleware } from '@trpc/server/adapters/express'
import session from 'express-session'

async function main() {
	// express implementation
	const app = express()

	app.use(
		session({
			secret: config.sessionSecret,
			resave: false,
			saveUninitialized: false,
		}),
	)

	app.use((req, _res, next) => {
		// request logger
		console.log('⬅️ ', req.method, req.path, req.body ?? req.query)
		next()
	})

	app.use(
		'/trpc',
		createExpressMiddleware({
			router: trpcRouter,
			createContext: ({ req, res }) => ({}),
		}),
	)

	app.get('/', (_req, res) => res.send('trival sequencer api'))

	app.listen(config.port, () => {
		console.log('listening on port 2021')
	})
}

void main()

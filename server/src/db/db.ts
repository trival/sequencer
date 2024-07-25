import { Database } from 'bun:sqlite'
import { drizzle } from 'drizzle-orm/bun-sqlite'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import * as path from 'node:path'
import { dbLocation } from '../config'
import { collection } from './schema/collection'
import { song } from './schema/song'
import { user } from './schema/user'

export const getDefaultConnection = () => {
	const connection = new Database(dbLocation)
	console.log('Using database:', dbLocation)

	if (dbLocation !== ':memory:') {
		connection.exec('PRAGMA journal_modej = WAL;')
	}

	return connection
}

export const getDb = (
	connection: Database,
	{ debug }: { debug?: boolean } = {},
) =>
	drizzle(connection, {
		logger: debug,
		schema: {
			user,
			song,
			collection,
		},
	})

export type Db = ReturnType<typeof getDb>

export const setupAndMigrateDb = async (db: Db) => {
	migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') })
}

import { drizzle } from 'drizzle-orm/bun-sqlite'
import { dbLocation } from '../config'
import { Database } from 'bun:sqlite'
import { users } from './schema/users'
import { songs } from './schema/songs'
import { collections } from './schema/collections'
import { migrate } from 'drizzle-orm/bun-sqlite/migrator'
import * as path from 'node:path'

export const getDefaultConnection = () => {
	const connection = new Database(dbLocation)
	console.log('Using database:', dbLocation)

	if (dbLocation !== ':memory:') {
		connection.exec('PRAGMA journal_modej = WAL;')
	}
}

export const getDb = (connection: Database) =>
	drizzle(connection, {
		schema: {
			users,
			songs,
			collections,
		},
	})

export type Db = ReturnType<typeof getDb>

export const setupAndMigrateDb = async (db: Db) => {
	migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') })
}

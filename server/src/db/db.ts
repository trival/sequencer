import { drizzle } from 'drizzle-orm/bun-sqlite'
import { dbLocation } from '../config'
import { Database } from 'bun:sqlite'
import { users } from './schema/users'
import { songs } from './schema/songs'
import { collections } from './schema/collections'

export const connection = new Database(dbLocation)
if (dbLocation !== ':memory:') {
	connection.exec('PRAGMA journal_modej = WAL;')
}

export const db = drizzle(connection, {
	schema: {
		users,
		songs,
		collections,
	},
})

export type Db = typeof db

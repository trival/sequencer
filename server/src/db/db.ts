import type { D1Database } from '@cloudflare/workers-types/experimental'
import { drizzle } from 'drizzle-orm/d1'
import { collection } from './schema/collection'
import { song } from './schema/song'
import { user } from './schema/user'

export const getDb = (
	connection: D1Database,
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

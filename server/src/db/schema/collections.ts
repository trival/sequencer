import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const collections = sqliteTable('collections', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
	title: text('title'),
	description: text('description'),
})

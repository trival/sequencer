import { sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { user } from './user'

export const collection = sqliteTable('collection', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	title: text('title'),
	description: text('description'),
})

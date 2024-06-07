import { integer, sqliteTable, text, blob } from 'drizzle-orm/sqlite-core'
import { users } from './users'
import { collections } from './collections'

export const songs = sqliteTable('songs', {
	id: text('id').primaryKey(),
	updatedAt: integer('updated_at'),
	isPublic: integer('is_public', { mode: 'boolean' }).default(true),

	userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
	collectionId: text('collection_id').references(() => collections.id, {
		onDelete: 'set null',
	}),

	data: blob('data'),
})

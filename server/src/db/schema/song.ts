import {
	blob,
	index,
	integer,
	sqliteTable,
	text,
	type AnySQLiteColumn,
} from 'drizzle-orm/sqlite-core'
import { collection } from './collection'
import { user } from './user'

export const song = sqliteTable(
	'song',
	{
		id: text('id').primaryKey(),
		updatedAt: integer('updated_at').notNull(),

		userId: text('user_id')
			.notNull()
			.references(() => user.id, {
				onDelete: 'cascade',
			}),
		forkedFromId: text('forked_from_id').references(
			(): AnySQLiteColumn => song.id,
			{ onDelete: 'set null' },
		),

		title: text('title').notNull(),
		description: text('description'),

		isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true),
		collectionId: text('collection_id').references(() => collection.id, {
			onDelete: 'set null',
		}),

		data: blob('data', { mode: 'buffer' }),
	},
	(table) => ({
		userIdx: index('user_idx').on(table.userId),
		collectionIdx: index('collection_idx').on(table.collectionId),
	}),
)

export type SongDbInsert = typeof song.$inferInsert
export type SongDb = typeof song.$inferSelect

import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable(
	'users',
	{
		id: text('id').primaryKey(),
		username: text('username').notNull(),
		password: text('password').notNull(),

		isPublic: integer('is_public', { mode: 'boolean' }).default(true),

		color: text('color'),
	},
	(table) => ({
		usernameIdx: index('username_idx').on(table.username),
	}),
)

export type UserDbInsert = typeof users.$inferInsert
export type UserDb = typeof users.$inferSelect

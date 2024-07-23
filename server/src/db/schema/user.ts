import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable(
	'user',
	{
		id: text('id').primaryKey(),
		username: text('username').unique().notNull(),
		email: text('email').unique().notNull(),
		passwordHash: text('password_hash').notNull(),

		isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true),
		color: text('color'),
	},
	(table) => ({
		usernameIdx: index('username_idx').on(table.username),
		emailIdx: index('email_idx').on(table.email),
	}),
)

export type UserDbInsert = typeof user.$inferInsert
export type UserDb = typeof user.$inferSelect

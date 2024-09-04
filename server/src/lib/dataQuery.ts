import { and, count, not, or, type SQL, type SQLWrapper } from 'drizzle-orm'
import type { SQLiteTableWithColumns } from 'drizzle-orm/sqlite-core'
import type { Db } from '../db/db'

export const MAX_LIST_QUERY_LIMIT = 1000

export interface Pagination {
	limit?: number
	offset?: number
}

export type CompositeFilter<Filter> = Filter & {
	_and?: CompositeFilter<Filter>[]
	_or?: CompositeFilter<Filter>[]
	_not?: CompositeFilter<Filter>
}

export type RepositoryQueryParams<Filter> = Pagination & {
	filter?: CompositeFilter<Filter>
	orderBy?: SQL
}

export function filterToWhereClause<Filter>(
	filter: CompositeFilter<Filter>,
	mapFilterKeyToDb: (
		key: keyof Filter,
		val: Filter[keyof Filter],
	) => SQLWrapper | undefined,
): SQL | undefined {
	const andParts: (SQLWrapper | undefined)[] = []
	const orParts: (SQLWrapper | undefined)[] = []
	for (const [key, val] of Object.entries(filter)) {
		if (key === '_and') {
			andParts.push(
				...(val as CompositeFilter<Filter>[]).map((f) =>
					filterToWhereClause(f, mapFilterKeyToDb),
				),
			)
		} else if (key === '_or') {
			orParts.push(
				...(val as CompositeFilter<Filter>[]).map((f) =>
					filterToWhereClause(f, mapFilterKeyToDb),
				),
			)
		} else if (key === '_not') {
			const sql = filterToWhereClause(
				val as CompositeFilter<Filter>,
				mapFilterKeyToDb,
			)
			if (sql) {
				andParts.push(not(sql))
			}
		} else {
			andParts.push(
				mapFilterKeyToDb(key as keyof Filter, val as Filter[keyof Filter]),
			)
		}
	}

	if (orParts.length === 1) {
		andParts.push(orParts[0])
	} else if (orParts.length > 1) {
		andParts.push(or(...orParts))
	}

	return and(...andParts)
}

export interface QueryResultList<T> {
	list: T[]
	totalCount: number
}

interface SearchQueryCreateParams<
	Schema extends SQLiteTableWithColumns<any>,
	Filters,
> {
	db: Db
	schema: Schema
	mapFilterKeyToDb?: (
		key: keyof Filters,
		val: Filters[keyof Filters],
	) => SQLWrapper | undefined
}

export function createSearchQuery<
	Schema extends SQLiteTableWithColumns<any>,
	Filters,
>({
	db,
	schema,
	mapFilterKeyToDb,
}: SearchQueryCreateParams<Schema, Filters>): (
	params?: RepositoryQueryParams<Filters>,
) => Promise<QueryResultList<Schema['$inferSelect']>> {
	const countQuery = db
		.select({ count: count(schema) })
		.from(schema)
		.prepare()

	return async (params) => {
		let query = db.select().from(schema)

		const where =
			params?.filter && mapFilterKeyToDb
				? filterToWhereClause(params.filter, mapFilterKeyToDb)
				: undefined

		if (where) {
			query = query.where(where) as any
		}

		const limit = Math.min(
			MAX_LIST_QUERY_LIMIT,
			params?.limit || MAX_LIST_QUERY_LIMIT,
		)

		if (limit) {
			query = query.limit(limit) as any
		}

		const offset = params?.offset ?? 0

		if (offset) {
			query = query.offset(offset) as any
		}

		if (params?.orderBy) {
			query = query.orderBy(params.orderBy) as any
		}

		let totalCount = 0

		if (where) {
			totalCount = await db
				.select({ count: count(schema) })
				.from(schema)
				.where(where)
				.execute()
				.then(([{ count }]) => count)
		} else {
			totalCount = await countQuery.execute().then(([{ count }]) => count)
		}

		const list = await query.execute()

		return {
			list,
			totalCount,
		}
	}
}

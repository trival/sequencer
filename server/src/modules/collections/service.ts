import type { Session } from 'express-session'
import type { Collection } from './model'

export interface CollectionService {
	byId(session: Session, id: string): Promise<Collection>
	listByUser(session: Session, userId: string): Promise<Collection[]>

	save(session: Session, collection: Collection): Promise<void>
	delete(session: Session, id: string): Promise<void>
}

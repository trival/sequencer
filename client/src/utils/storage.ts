import { Collection, Profile, SongEntity } from '@/datamodel'

export interface Storage {
	getProfile(userId: string): Promise<Profile | null>
	createProfile(profile: Profile): Promise<void>
	updateProfile(
		userId: string,
		profile: Partial<Omit<Profile, 'userId'>>,
	): Promise<void>

	songsByUser(userId: string): Promise<SongEntity[]>
	songsByCollection(collectionId: string): Promise<SongEntity[]>
	songsByLatest(): Promise<SongEntity[]>
	songById(id: string): Promise<SongEntity>

	createSong(song: SongEntity): Promise<void>
	updateSong(id: string, song: Partial<SongEntity>): Promise<void>
	deleteSong(id: string): Promise<void>

	collectionsByUser(userId: string): Promise<Collection[]>

	createCollection(collection: Collection): Promise<void>
	updateCollection(id: string, collection: Partial<Collection>): Promise<void>
	deleteCollection(id: string): Promise<void>
}

export function createLocalStorage(): Storage {
	const storage: Storage = {} as Storage

	return storage
}

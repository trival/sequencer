import { Collection, Profile, Song } from '@/datamodel'

export interface Storage {
	songsByUser(userId: string): Promise<Song[]>
	songsByCollection(collectionId: string): Promise<Song[]>
	songsByLatest(): Promise<Song[]>
	songById(id: string): Promise<Song>

	collectionsByUser(userId: string): Promise<Collection[]>

	createSong(song: Song): Promise<void>
	updateSong(id: string, song: Partial<Song>): Promise<void>
	deleteSong(id: string): Promise<void>

	createCollection(collection: Collection): Promise<Collection>
	updateCollection(id: string, collection: Partial<Collection>): Promise<void>
	deleteCollection(id: string): Promise<void>

	updateProfile(profile: Partial<Profile>): Promise<void>
}

export function createLocalStorage(): Storage {
	const storage: Storage = {} as Storage

	return storage
}

export function createDBStorage(): Storage {
	const storage: Storage = {} as Storage

	return storage
}

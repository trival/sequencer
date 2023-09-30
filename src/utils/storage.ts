import { Collection, Profile, Song } from '@/datamodel'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../database.types'

export interface Storage {
	getProfile(userId: string): Promise<Profile | null>
	createProfile(profile: Profile): Promise<void>
	updateProfile(
		userId: string,
		profile: Partial<Omit<Profile, 'userId'>>,
	): Promise<void>

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
}

export function createLocalStorage(): Storage {
	const storage: Storage = {} as Storage

	return storage
}

export function createSupabaseStorage(
	supabase: SupabaseClient<Database>,
): Storage {
	const storage: Storage = {
		getProfile: async (userId: string) => {
			const { data, error, status } = await supabase
				.from('profile')
				.select('*')
				.eq('user_id', userId)
				.single()

			if (error || status >= 400) {
				throw error
			}

			return data
				? {
						userId: data.user_id,
						username: data.username ?? '',
						color: data.color ?? '',
				  }
				: null
		},

		createProfile: async (profile: Profile) => {
			const { error, status } = await supabase.from('profile').insert({
				user_id: profile.userId,
				username: profile.username,
				color: profile.color,
			})

			if (error || status >= 400) {
				throw error
			}
		},

		updateProfile: async (userId: string, profile: Partial<Profile>) => {
			const { error, status } = await supabase
				.from('profile')
				.update(profile)
				.eq('user_id', userId)

			if (error || status >= 400) {
				throw error
			}
		},
	} as Storage

	return storage
}

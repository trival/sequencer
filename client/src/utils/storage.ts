import { Collection, Profile, SongEntity } from '@/datamodel'
import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../database.types'
import { emptySongEntity } from './song'

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

export function createSupabaseStorage(
	supabase: SupabaseClient<Database>,
): Storage {
	const storage: Storage = {
		getProfile: async (userId) => {
			const { data, error, status } = await supabase
				.from('profile')
				.select('*')
				.eq('user_id', userId)
				.single()

			if (error || status >= 400) {
				throw error || new Error('Failed to get profile')
			}

			return data
				? {
						userId: data.user_id,
						username: data.username ?? '',
						color: data.color ?? '',
				  }
				: null
		},

		createProfile: async (profile) => {
			const { error, status } = await supabase.from('profile').insert({
				user_id: profile.userId,
				username: profile.username,
				color: profile.color,
			})

			if (error || status >= 400) {
				throw error || new Error('Failed to create profile')
			}
		},

		updateProfile: async (userId, profile) => {
			const { error, status } = await supabase
				.from('profile')
				.update({ ...profile })
				.eq('user_id', userId)

			if (error || status >= 400) {
				throw error || new Error('Failed to update profile')
			}
		},

		songsByUser: async (userId) => {
			const { data, error, status } = await supabase
				.from('song')
				.select('*')
				.eq('user_id', userId)

			if (error || status >= 400) {
				throw error || new Error('Failed to get songs')
			}

			return data.map(mapSongResult)
		},

		songById: async (id) => {
			const { data, error, status } = await supabase
				.from('song')
				.select('*')
				.eq('id', id)
				.single()

			if (error || status >= 400) {
				throw error || new Error('Failed to get song')
			}

			return mapSongResult(data)
		},

		createSong: async (song) => {
			const { error, status } = await supabase.from('song').insert({
				id: song.id,
				user_id: song.meta.userId,
				title: song.meta.title,
				description: song.meta.description,
				collection: song.meta.collection,
				data: song.data as any,
			})

			if (error || status >= 400) {
				throw error || new Error('Failed to create song')
			}
		},

		updateSong: async (id, song) => {
			const { error, status } = await supabase
				.from('song')
				.update({
					title: song.meta?.title,
					description: song.meta?.description,
					collection: song.meta?.collection,
					data: song.data as any,
					updated_at: new Date().toISOString(),
				})
				.eq('id', id)

			if (error || status >= 400) {
				throw error || new Error('Failed to update song')
			}
		},

		deleteSong: async (id) => {
			const { error, status } = await supabase
				.from('song')
				.delete()
				.eq('id', id)

			if (error || status >= 400) {
				throw error || new Error('Failed to delete song')
			}
		},

		collectionsByUser: async (userId) => {
			const { data, error, status } = await supabase
				.from('collection')
				.select('*')
				.eq('user_id', userId)

			if (error || status >= 400) {
				throw error || new Error('Failed to get collections')
			}

			return data.map((res) => ({
				id: res.id,
				userId: res.user_id,
				title: res.title,
				description: res.description,
			}))
		},

		createCollection: async (collection) => {
			const { error, status } = await supabase.from('collection').insert({
				id: collection.id,
				user_id: collection.userId,
				title: collection.title,
				description: collection.description,
			})

			if (error || status >= 400) {
				throw error || new Error('Failed to create collection')
			}
		},

		updateCollection: async (id, collection) => {
			const { error, status } = await supabase
				.from('collection')
				.update({
					title: collection.title,
					description: collection.description,
					updated_at: new Date().toISOString(),
				})
				.eq('id', id)

			if (error || status >= 400) {
				throw error || new Error('Failed to update collection')
			}
		},

		deleteCollection: async (id) => {
			const { error, status } = await supabase
				.from('collection')
				.delete()
				.eq('id', id)

			if (error || status >= 400) {
				throw error || new Error('Failed to delete collection')
			}
		},
	} as Storage

	return storage
}

function mapSongResult(
	res: Database['public']['Tables']['song']['Row'],
): SongEntity {
	const data: any = res.data
	const song = emptySongEntity()

	song.id = res.id

	song.meta.userId = res.user_id
	song.meta.title = res.title || ''
	song.meta.description = res.description || ''
	song.meta.collection = res.collection || undefined
	song.meta.basedOn = res.copied_from || undefined
	song.meta.createdAt = res.created_at
	song.meta.updatedAt = res.updated_at

	song.data.song.bpm = data.song.bpm
	song.data.song.swing = data.song.swing
	song.data.song.timeSignature = data.song.timeSignature

	song.data.song.instruments = data.song.instruments
	song.data.keyboardSettings = data.keyboardSettings
	song.data.editorSettings = data.trackSettings

	song.data.song.tracks = data.song.tracks

	return song
}

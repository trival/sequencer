import type { Db } from './db/db'
import {
	createAccountDbRepository,
	type AccountRepository,
} from './modules/account/repo'
import {
	createAccountService,
	type AccountService,
} from './modules/account/service'
import {
	createSongDbRepository,
	type SongReporitory,
} from './modules/songs/repo'
import { createSongService, type SongService } from './modules/songs/service'

export interface Repositories {
	account: AccountRepository
	song: SongReporitory
}

export interface Services {
	account: AccountService
	song: SongService
}

export const createRepositories = (db: Db): Repositories => {
	return {
		account: createAccountDbRepository(db),
		song: createSongDbRepository(db),
		// collection: createCollectionDbRepository(db),
	}
}

export const createServices = (repos: Repositories): Services => {
	return {
		account: createAccountService(repos.account),
		song: createSongService(repos.song),
	}
}

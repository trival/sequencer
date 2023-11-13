import { Show, createMemo } from 'solid-js'
import { useAppState } from '@/AppState'
import ProfileForm from '@/components/profileForm'
import { supabase } from '@/utils/supabase'
import { Auth } from '@supabase/auth-ui-solid'
import ProfileSongList from '@/components/profileList'
import NavBar from '@/components/songNav'
import PlayerUI from '@/components/player'
import { createPlayer } from '@/utils/songPlayer'
import { createSynth } from '@/utils/synth'
import { emptySongEntity, createSongState } from '@/utils/song'
import {
	createEditorSettingState,
	createKeyboardSettingState,
} from '@/utils/settings'
import { SongMeta } from '@/datamodel'
import { Subpage } from '@/components/shared/SimpleSubpage'
import { LogoutButton } from '@/components/buttons'

export default function App() {
	const [state, { updateProfile, saveSong, closeSong, openSong, logout }] =
		useAppState()

	const currentSong = createMemo(
		() => (state.currentSongId && state.songs[state.currentSongId]) || null,
	)

	const synth = createMemo(() => {
		return createSynth(currentSong()?.data.song.instruments)
	})

	const player = createMemo(() => {
		return createPlayer(synth())
	})

	const keyboardState = createMemo(() => {
		return createKeyboardSettingState(currentSong()?.data.keyboardSettings)
	})

	const editorState = createMemo(() => {
		return createEditorSettingState(currentSong()?.data.editorSettings)
	})

	const songState = createMemo(() => {
		const song = currentSong() || emptySongEntity()
		return createSongState(song.data.song, editorState().data())
	})

	const openSongs = createMemo(() =>
		state.openSongIds.map((id) => state.songs[id]),
	)

	function saveSongMeta(id: string, meta: Partial<SongMeta>) {
		const song = state.songs[id]
		if (song) {
			const updatedSong = {
				...song,
				meta: { ...song.meta, ...meta },
			}
			if (song.id === currentSong()?.id) {
				updatedSong.data = {
					song: songState().data(),
					editorSettings: editorState().data(),
					keyboardSettings: keyboardState().data(),
				}
			}
			saveSong(id, updatedSong)
		}
	}

	return (
		<Show
			when={state.profile}
			fallback={
				<Subpage>
					<div class="m-auto my-4 bg-white px-6 py-12 shadow sm:w-full sm:max-w-[480px] sm:rounded-lg sm:px-12 md:my-16">
						<Auth supabaseClient={supabase} />
					</div>
				</Subpage>
			}
		>
			{state.profile?.username ? (
				<>
					<NavBar
						currentSong={currentSong()}
						onCloseSong={(id) => closeSong(id)}
						onOpenSong={(id) => openSong(id)}
						onUpdateSongMeta={(id, meta) => {
							saveSongMeta(id, meta)
						}}
						onLogout={() => logout()}
						keyboardState={currentSong() ? keyboardState() : undefined}
					/>
					<Show when={currentSong()} fallback={<ProfileSongList />}>
						<PlayerUI
							onSave={(songData) => {
								const song = currentSong()!
								saveSong(song.id, { ...song, data: songData })
							}}
							song={songState()}
							songPlayer={player()}
							synth={synth()}
							editorSettings={editorState().data()}
							keyboardSettings={keyboardState().data()}
						/>
					</Show>
				</>
			) : (
				<Subpage navOpts={<LogoutButton onLogout={() => logout()} />}>
					<div class="m-auto my-4 bg-white px-6 py-12 shadow sm:w-full sm:max-w-[480px] sm:rounded-lg sm:px-12 md:my-16">
						<ProfileForm
							username=""
							onSubmit={(username, color) => {
								updateProfile({ username, color })
							}}
						/>
					</div>
				</Subpage>
			)}
		</Show>
	)
}

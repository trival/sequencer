import {
	EditorSettings,
	KeyboardSettings,
	SongData,
	SongEntity,
	Subdivision,
} from '@/datamodel'
import { processSong } from '@/utils/processedTrack'
import { SongActions } from '@/utils/song'
import { SongPlayer } from '@/utils/songPlayer'
import { SynthPlayer } from '@/utils/synth'
import { createEffect, createMemo, createSignal } from 'solid-js'
import { ActiveNote, Keyboard } from './keyboard'
import { SongControls } from './songControls'
import { Track } from './track'

interface PlayerProps {
	songEntity: SongEntity
	songActions: SongActions
	keyboardSettings: KeyboardSettings
	editorSettings: EditorSettings
	synth: SynthPlayer
	songPlayer: SongPlayer
	onSave?: () => void
	onSongDataChanged?: (songData: SongData) => void
}

export default function Player(props: PlayerProps) {
	const isPlaying = createMemo(() => props.songPlayer.playingNotes().length > 0)
	const songData = createMemo(() => props.songEntity.data)

	const [activeNoteIds, setActiveNoteIds] = createSignal<[number, number][]>([])

	const onActivateNote = (midi: number) => {
		const ids = activeNoteIds()
		const idx = ids[0]
		if (ids.length === 1 && idx && !isPlaying()) {
			const track = songData().song.tracks[idx[0]]
			const note = track?.notes[idx[1]]
			if (!note) return
			if (!note.midiNotes.includes(midi)) {
				const newNotes = [...note.midiNotes, midi]
				props.songActions.updateNoteTones(idx[0], idx[1], newNotes)
			}
			props.songPlayer.playNote(songData().song, ...idx)
		} else {
			props.synth.play(0, [midi])
		}
	}

	const onDeactivateNote = (midi: number) => {
		const ids = activeNoteIds()
		const idx = ids[0]
		if (ids.length === 1 && idx && !isPlaying()) {
			const track = songData().song.tracks[idx[0]]
			const note = track?.notes[idx[1]]
			if (!note) return
			if (note.midiNotes.includes(midi)) {
				const newNotes = note.midiNotes.filter((n) => n !== midi)
				props.songActions.updateNoteTones(idx[0], idx[1], newNotes)
			}
			props.songPlayer.playNote(songData().song, ...idx)
		} else {
			props.synth.stop(0, [midi])
		}
	}

	const onNoteClicked = (trackIdx: number, noteIdx: number) => {
		const ids = activeNoteIds()
		console.log('onclick', ids)
		const idx = ids.find(([t, n]) => t === trackIdx && n === noteIdx)
		if (idx) {
			setActiveNoteIds(ids.filter((i) => i !== idx))
		} else {
			setActiveNoteIds([[trackIdx, noteIdx]])
			props.songPlayer.playNote(songData().song, trackIdx, noteIdx)
		}
	}

	const onNoteAddedBefore = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		props.songActions.addNote(trackIdx, noteIdx, { duration, midiNotes: [] })
	}

	const onNoteAddedAfter = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		props.songActions.addNote(trackIdx, noteIdx + 1, {
			duration,
			midiNotes: [],
		})
		onNoteClicked(trackIdx, noteIdx + 1)
	}

	const onNoteAdded = (trackIdx: number) => {
		const track = songData().song.tracks[trackIdx]
		if (track) {
			const noteIdx = track.notes.length
			props.songActions.addNote(trackIdx, noteIdx, {
				duration: props.editorSettings.defaultNoteDuration,
				midiNotes: [],
			})
			onNoteClicked(trackIdx, noteIdx)
		}
	}

	const onNoteRemoved = (trackIdx: number, noteIdx: number) => {
		const track = songData().song.tracks[trackIdx]
		if (!track) return
		const ids = activeNoteIds().filter(
			([t, n]) => t === trackIdx && n === noteIdx,
		)
		if (noteIdx === track.notes.length - 1) {
			if (track.notes.length > 1) {
				setActiveNoteIds(ids.concat([[trackIdx, noteIdx - 1]]))
			} else {
				setActiveNoteIds(ids)
			}
		}
		props.songActions.removeNote(trackIdx, noteIdx)
	}

	const onDurationChanged = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		props.songActions.changeDuration(trackIdx, noteIdx, duration)
	}

	const activeMidiNotes = () => {
		const ids = activeNoteIds()
		const s = songData().song

		const activeNotes: ActiveNote[] = ids
			.concat(props.songPlayer.playingNotes())
			.flatMap((idx) => {
				const track = idx ? s.tracks[idx[0]] : null
				const note = idx ? track?.notes[idx[1]] : null
				const instrument = track
					? s.instruments?.[track.instrument]?.color
					: undefined
				return (
					note?.midiNotes.map((note) => ({
						note,
						color: instrument,
					})) || []
				)
			})

		return activeNotes.concat(
			props.synth.playingNotes().flatMap((notes, i) => {
				const color = songData().song.instruments?.[i].color
				return notes.map((note) => ({ note, color }))
			}),
		)
	}

	const onTrackAdded = () => {
		props.songActions.addTrack()
	}

	createEffect(() => {
		if (props.songPlayer.playingNotes().length > 0) {
			setActiveNoteIds(props.songPlayer.playingNotes())
		}
	})

	return (
		<div class="m-0 md:mx-8">
			<Keyboard
				class="shadow-md"
				maxVHeight={80}
				activeNotes={activeMidiNotes()}
				onNoteActivated={onActivateNote}
				onNoteDeactivated={onDeactivateNote}
				settings={props.keyboardSettings}
				mode={activeNoteIds().length === 1 && !isPlaying() ? 'Record' : 'Play'}
			/>
			<div class="mt-2">
				<Track
					tracks={processSong(songData().song)}
					activeNoteIds={activeNoteIds()}
					onNoteClicked={onNoteClicked}
					onAddNote={(trackIdx) => onNoteAdded(trackIdx)}
					onTrackAdded={onTrackAdded}
				/>
				<SongControls
					songEntity={props.songEntity}
					onSongDataChanged={props.onSongDataChanged}
					defaultDuration={props.editorSettings.defaultNoteDuration}
					isPlaying={isPlaying()}
					activeNoteIds={activeNoteIds()}
					onPropsChanged={(data) => props.songActions.updateProps(data)}
					onPlay={() => {
						if (isPlaying()) {
							props.songPlayer.stop()
						} else {
							props.songPlayer.play(
								songData().song,
								activeNoteIds().length === 1 ? activeNoteIds()[0] : undefined,
							)
						}
					}}
					onStop={() => {
						props.songPlayer.stop()
						setActiveNoteIds([])
					}}
					onRemove={onNoteRemoved}
					onAddBefore={onNoteAddedBefore}
					onAddAfter={onNoteAddedAfter}
					onDurationChanged={onDurationChanged}
					onSave={props.onSave}
				/>
			</div>
		</div>
	)
}

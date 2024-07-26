import {
	SongData,
	KeyboardSettings,
	EditorSettings,
	Subdivision,
} from '@/datamodel'
import { SongState } from '@/utils/song'
import { SynthPlayer } from '@/utils/synth'
import { createEffect, createMemo, createSignal } from 'solid-js'
import { ActiveNote, Keyboard } from './keyboard'
import { Track } from './track'
import { SongControls } from './songControls'
import { processSong } from '@/utils/processedTrack'
import { SongPlayer } from '@/utils/songPlayer'

interface PlayerProps {
	song: SongState
	keyboardSettings: KeyboardSettings
	editorSettings: EditorSettings
	synth: SynthPlayer
	songPlayer: SongPlayer
	onSave: (song: SongData) => void
}

export default function Player(props: PlayerProps) {
	const isPlaying = createMemo(() => props.songPlayer.playingNotes().length > 0)

	const [activeNoteIds, setActiveNoteIds] = createSignal<[number, number][]>([])

	const onActivateNote = (midi: number) => {
		const ids = activeNoteIds()
		const idx = ids[0]
		if (ids.length === 1 && idx && !isPlaying()) {
			const track = props.song.data().tracks[idx[0]]
			const note = track?.notes[idx[1]]
			if (!note) return
			if (!note.midiNotes.includes(midi)) {
				const newNotes = [...note.midiNotes, midi]
				props.song.updateNoteTones(idx[0], idx[1], newNotes)
			}
			props.songPlayer.playNote(props.song.data(), ...idx)
		} else {
			props.synth.play(0, [midi])
		}
	}

	const onDeactivateNote = (midi: number) => {
		const ids = activeNoteIds()
		const idx = ids[0]
		if (ids.length === 1 && idx && !isPlaying()) {
			const track = props.song.data().tracks[idx[0]]
			const note = track?.notes[idx[1]]
			if (!note) return
			if (note.midiNotes.includes(midi)) {
				const newNotes = note.midiNotes.filter((n) => n !== midi)
				props.song.updateNoteTones(idx[0], idx[1], newNotes)
			}
			props.songPlayer.playNote(props.song.data(), ...idx)
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
			props.songPlayer.playNote(props.song.data(), trackIdx, noteIdx)
		}
	}

	const onNoteAddedBefore = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		props.song.addNote(trackIdx, noteIdx, { duration, midiNotes: [] })
	}

	const onNoteAddedAfter = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		props.song.addNote(trackIdx, noteIdx + 1, { duration, midiNotes: [] })
		onNoteClicked(trackIdx, noteIdx + 1)
	}

	const onNoteAdded = (trackIdx: number) => {
		const track = props.song.data().tracks[trackIdx]
		if (track) {
			const noteIdx = track.notes.length
			props.song.addNote(trackIdx, noteIdx, {
				duration: props.editorSettings.defaultNoteDuration,
				midiNotes: [],
			})
			onNoteClicked(trackIdx, noteIdx)
		}
	}

	const onNoteRemoved = (trackIdx: number, noteIdx: number) => {
		const track = props.song.data().tracks[trackIdx]
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
		props.song.removeNote(trackIdx, noteIdx)
	}

	const onDurationChanged = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		props.song.changeDuration(trackIdx, noteIdx, duration)
	}

	const activeMidiNotes = () => {
		const ids = activeNoteIds()
		const s = props.song.data()

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
				const color = props.song.data().instruments?.[i].color
				return notes.map((note) => ({ note, color }))
			}),
		)
	}

	const onTrackAdded = () => {
		props.song.addTrack()
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
					tracks={processSong(props.song.data())}
					activeNoteIds={activeNoteIds()}
					onNoteClicked={onNoteClicked}
					onAddNote={(trackIdx) => onNoteAdded(trackIdx)}
					onTrackAdded={onTrackAdded}
				/>
				<SongControls
					song={props.song.data()}
					defaultDuration={props.editorSettings.defaultNoteDuration}
					isPlaying={isPlaying()}
					activeNoteIds={activeNoteIds()}
					onPropsChanged={(data) => props.song.updateProps(data)}
					onPlay={() => {
						isPlaying()
							? props.songPlayer.stop()
							: props.songPlayer.play(
									props.song.data(),
									activeNoteIds().length === 1 ? activeNoteIds()[0] : undefined,
								)
					}}
					onStop={() => {
						props.songPlayer.stop()
						setActiveNoteIds([])
					}}
					onRemove={onNoteRemoved}
					onAddBefore={onNoteAddedBefore}
					onAddAfter={onNoteAddedAfter}
					onDurationChanged={onDurationChanged}
					onSave={() =>
						props.onSave({
							song: props.song.data(),
							keyboardSettings: props.keyboardSettings,
							editorSettings: props.editorSettings,
						})
					}
				/>
			</div>
		</div>
	)
}

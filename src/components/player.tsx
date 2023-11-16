import { SongData, KeyboardSettings, EditorSettings } from '@/datamodel'
import { SongState } from '@/utils/song'
import { SynthPlayer } from '@/utils/synth'
import { createEffect, createMemo, createSignal } from 'solid-js'
import { Subdivision } from 'tone/build/esm/core/type/Units'
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

	const [activeNoteIdx, setActiveNoteIdx] = createSignal<
		[number, number] | null
	>(null)

	const onActivateNote = (midi: number) => {
		const idx = activeNoteIdx()
		if (idx && !isPlaying()) {
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
		const idx = activeNoteIdx()
		if (idx && !isPlaying()) {
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
		const idx = activeNoteIdx()
		if (idx && idx[0] === trackIdx && idx[1] === noteIdx) {
			setActiveNoteIdx(null)
		} else {
			setActiveNoteIdx([trackIdx, noteIdx])
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
		if (noteIdx === track.notes.length - 1) {
			if (track.notes.length > 1) {
				setActiveNoteIdx([trackIdx, noteIdx - 1])
			} else {
				setActiveNoteIdx(null)
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
		const idx = activeNoteIdx()
		const s = props.song.data()
		const track = idx ? s.tracks[idx[0]] : null
		const note = idx ? track?.notes[idx[1]] : null
		const instrument = track
			? s.instruments?.[track.instrument]?.color
			: undefined

		let notes: ActiveNote[] = ([] as ActiveNote[]).concat(
			props.synth.playingNotes().flatMap((notes, i) => {
				const color = props.song.data().instruments?.[i].color
				return notes.map((note) => ({ note, color }))
			}),
		)

		if (note) {
			notes = notes.concat(
				note.midiNotes.map((note) => ({
					note,
					color: instrument,
				})),
			)
		}

		return notes
	}

	const onTrackAdded = () => {
		props.song.addTrack()
	}

	createEffect(() => {
		console.log(props.songPlayer.playingNotes())
		props.songPlayer.playingNotes().forEach((notes) => {
			setActiveNoteIdx(notes)
		})
	})

	return (
		<div class="m-0 md:mx-8">
			<div class="relative h-[620px] max-h-[80vh] w-[620px] max-w-full shadow-md">
				<div class="absolute bottom-0 left-0 right-0 top-0 overflow-scroll">
					<Keyboard
						activeNotes={activeMidiNotes()}
						onNoteActivated={onActivateNote}
						onNoteDeactivated={onDeactivateNote}
						settings={props.keyboardSettings}
						mode={activeNoteIdx() !== null && !isPlaying() ? 'Record' : 'Play'}
					/>
				</div>
			</div>
			<div class="mt-2">
				<Track
					tracks={processSong(props.song.data())}
					activeNoteIdx={activeNoteIdx()}
					onNoteClicked={onNoteClicked}
					onAddNote={(trackIdx) => onNoteAdded(trackIdx)}
					onTrackAdded={onTrackAdded}
				/>
				<SongControls
					song={props.song.data()}
					defaultDuration={props.editorSettings.defaultNoteDuration}
					isPlaying={isPlaying()}
					activeNoteIdx={activeNoteIdx()}
					onPropsChanged={(data) => props.song.updateProps(data)}
					onPlay={() => {
						isPlaying()
							? props.songPlayer.stop()
							: props.songPlayer.play(
									props.song.data(),
									activeNoteIdx() ?? undefined,
							  )
					}}
					onStop={() => {
						props.songPlayer.stop()
						setActiveNoteIdx(null)
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

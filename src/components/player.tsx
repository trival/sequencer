import { SongData, KeyboardSettings } from '@/datamodel'
import { useSongEditor } from '@/utils/song'
import { SynthPlayer } from '@/utils/synth'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { toMidi } from '@/utils/utils'
import { createMemo, createSignal } from 'solid-js'
import { Subdivision } from 'tone/build/esm/core/type/Units'
import { ActiveNote, Keyboard } from './keyboard'
import { Track } from './track'
import { SongControls } from './songControls'
import { processSong } from '@/utils/processedTrack'
import { SongPlayer } from '@/utils/songPlayer'

interface PlayerProps {
	song: SongData
	synth: SynthPlayer
	songPlayer: SongPlayer
	onSave: (song: SongData) => void
}

export default function Player(props: PlayerProps) {
	const song = createMemo(() => useSongEditor(props.song))

	const propsSettings = createMemo(
		() =>
			song().data().keyboardSettings ?? {
				baseNote: toMidi('C3'),
				scaleHighlight: ScaleHighlight.Major,
				toneColorType: ToneColorType.CircleOfFiths,
			},
	)

	const [updatedSettings, setSettings] = createSignal<
		Partial<KeyboardSettings>
	>({})

	const settings = () => ({ ...propsSettings(), ...updatedSettings() })

	const [activeNoteIdx, setActiveNoteIdx] = createSignal<
		[number, number] | null
	>(null)

	const onActivateNote = (midi: number) => {
		const idx = activeNoteIdx()
		if (idx) {
			const track = song().data().tracks[idx[0]]
			const note = track?.notes[idx[1]]
			if (!note) return
			if (!note.midiNotes.includes(midi)) {
				const newNotes = [...note.midiNotes, midi]
				song().updateNoteTones(idx[0], idx[1], newNotes)
			}
			props.songPlayer.playNote(...idx)
		} else {
			props.synth.play(0, [midi])
		}
	}

	const onDeactivateNote = (midi: number) => {
		const idx = activeNoteIdx()
		if (idx) {
			const track = song().data().tracks[idx[0]]
			const note = track?.notes[idx[1]]
			if (!note) return
			if (note.midiNotes.includes(midi)) {
				const newNotes = note.midiNotes.filter((n) => n !== midi)
				song().updateNoteTones(idx[0], idx[1], newNotes)
			}
			props.songPlayer.playNote(...idx)
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
			props.songPlayer.playNote(trackIdx, noteIdx)
		}
	}

	const onNoteAddedBefore = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		song().addNote(trackIdx, noteIdx, { duration, midiNotes: [] })
	}

	const onNoteAddedAfter = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		song().addNote(trackIdx, noteIdx + 1, { duration, midiNotes: [] })
		onNoteClicked(trackIdx, noteIdx + 1)
	}

	const onNoteRemoved = (trackIdx: number, noteIdx: number) => {
		const track = song().data().tracks[trackIdx]
		if (!track) return
		if (noteIdx === track.notes.length - 1) {
			if (track.notes.length > 1) {
				setActiveNoteIdx([trackIdx, noteIdx - 1])
			} else {
				setActiveNoteIdx(null)
			}
		}
		song().removeNote(trackIdx, noteIdx)
	}

	const onDurationChanged = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		song().changeDuration(trackIdx, noteIdx, duration)
	}

	const activeMidiNotes = () => {
		const idx = activeNoteIdx()
		const s = song().data()
		const track = idx ? s.tracks[idx[0]] : null
		const note = idx ? track?.notes[idx[1]] : null
		const instrument = track
			? s.instruments?.[track.instrument]?.color
			: undefined

		return note
			? note.midiNotes.map(
					(note) =>
						({
							note,
							color: instrument,
						}) as ActiveNote,
			  )
			: props.synth.playingNotes().flatMap((notes, i) => {
					const color = song().data().instruments?.[i].color
					return notes.map((note) => ({ note, color }))
			  })
	}

	return (
		<div>
			<div class="relative h-[620px] w-[620px] max-w-full shadow-md">
				<div class="absolute bottom-0 left-0 right-0 top-0 overflow-scroll">
					<Keyboard
						activeNotes={activeMidiNotes()}
						onNoteActivated={onActivateNote}
						onNoteDeactivated={onDeactivateNote}
						onSettingsChanged={setSettings}
						settings={settings()}
						mode={activeNoteIdx() !== null ? 'Record' : 'Play'}
					/>
				</div>
			</div>
			<div class="mt-2">
				<Track
					song={processSong(song().data())}
					activeNoteIdx={activeNoteIdx()}
					onNoteClicked={onNoteClicked}
				/>
				<SongControls
					song={song().data()}
					isPlaying={props.songPlayer.playingNotes().length > 0}
					activeNoteIdx={activeNoteIdx()}
					onPropsChanged={(data) => song().updateProps(data)}
					onPlay={() => props.songPlayer.play()}
					onStop={() => props.songPlayer.stop()}
					onRemove={onNoteRemoved}
					onAddBefore={onNoteAddedBefore}
					onAddAfter={onNoteAddedAfter}
					onDurationChanged={onDurationChanged}
					onSave={() =>
						props.onSave({ ...song().data(), keyboardSettings: settings() })
					}
				/>
			</div>
		</div>
	)
}

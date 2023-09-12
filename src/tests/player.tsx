import { Keyboard, KeyboardSettings } from '@/components/keyboard'
import { Track } from '@/components/track'
import { TrackNote, ProcessedNote, useSong } from '@/utils/song'
import { useSynth } from '@/utils/synth'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { toMidi } from '@/utils/utils'
import { Subdivision } from 'tone/build/esm/core/type/Units'
import * as Tone from 'tone'
import { createSignal } from 'solid-js'

const initialMelody: TrackNote[] = [
	{ midiNotes: [toMidi('C3')], duration: '4n' },
	{ midiNotes: [toMidi('C3')], duration: '4n.' },
	{ midiNotes: [toMidi('C3')], duration: '4n.' },
	{ midiNotes: [toMidi('F3')], duration: '2n' },
	{ midiNotes: [], duration: '4n.' },
	{ midiNotes: [toMidi('F3')], duration: '8n' },
	{ midiNotes: [toMidi('G3')], duration: '2n' },
	{ midiNotes: [toMidi('G3')], duration: '2n' },
]

export default function PlayerTest() {
	const synth = useSynth()

	const { song, addNote, removeNote, changeDuration, updateNoteTones } =
		useSong({ bpm: 160, tracks: [initialMelody] })

	const [activeNoteIdx, setActiveNoteIdx] = createSignal<
		[number, number] | null
	>(null)
	const [isPlaying, setIsPlaying] = createSignal(false)
	const [playingSequence, setPlayingSequence] = createSignal<
		Tone.Part<ProcessedNote>[] | null
	>(null)

	const onPlay = async () => {
		if (!isPlaying()) {
			await Tone.start()
			Tone.Transport.start()

			const seqs = song().map((track, i) => {
				const seq = new Tone.Part((time, note: ProcessedNote) => {
					synth.play(note.midiNotes, note.duration, time)
					setActiveNoteIdx([i, track.notes.indexOf(note)])
				}, track.notes)
				seq.loop = true
				seq.loopEnd = track.duration
				return seq
			})

			const idx = activeNoteIdx()
			const note = idx && song()[idx[0]]?.notes[idx[1]]

			if (note) {
				seqs.forEach((seq) => {
					seq.start(0, note.time)
				})
			} else {
				seqs.forEach((seq) => {
					seq.start()
				})
			}

			setPlayingSequence(seqs)
			setIsPlaying(true)
		} else {
			playingSequence()?.forEach((seq) => {
				seq.stop()
			})

			Tone.Transport.stop()
			setPlayingSequence(null)
			setIsPlaying(false)
		}
	}

	const onActivateNote = (midi: number) => {
		const idx = activeNoteIdx()
		if (idx) {
			const note = song()[idx[0]]?.notes[idx[1]]
			if (!note) return
			if (!note.midiNotes.includes(midi)) {
				const newNotes = [...note.midiNotes, midi]
				updateNoteTones(idx[0], idx[1], newNotes)
				synth.play(newNotes, note.duration)
			} else {
				synth.play(note.midiNotes, note.duration)
			}
		} else {
			synth.play([midi])
		}
	}

	const onDeactivateNote = (midi: number) => {
		const idx = activeNoteIdx()
		if (idx) {
			const note = song()[idx[0]]?.notes[idx[1]]
			if (!note) return
			if (note.midiNotes.includes(midi)) {
				const newNotes = note.midiNotes.filter((n) => n !== midi)
				updateNoteTones(idx[0], idx[1], newNotes)
				synth.play(newNotes, note.duration)
			} else {
				synth.play(note.midiNotes, note.duration)
			}
		} else {
			synth.stop([midi])
		}
	}

	const onNoteClicked = (trackIdx: number, noteIdx: number) => {
		const idx = activeNoteIdx()
		if (idx && idx[0] === trackIdx && idx[1] === noteIdx) {
			setActiveNoteIdx(null)
		} else {
			setActiveNoteIdx([trackIdx, noteIdx])
			const note = song()[trackIdx]?.notes[noteIdx]
			if (!note) return
			synth.play(note.midiNotes, note.duration)
		}
	}

	const onNoteAddedBefore = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		addNote(trackIdx, noteIdx, { duration, midiNotes: [] })
	}

	const onNoteAddedAfter = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		addNote(trackIdx, noteIdx + 1, { duration, midiNotes: [] })
		onNoteClicked(trackIdx, noteIdx + 1)
	}

	const onNoteRemoved = (trackIdx: number, noteIdx: number) => {
		const track = song()[trackIdx]
		if (!track) return
		if (noteIdx === track.notes.length - 1) {
			if (track.notes.length > 1) {
				setActiveNoteIdx([trackIdx, noteIdx - 1])
			} else {
				setActiveNoteIdx(null)
			}
		}
		removeNote(trackIdx, noteIdx)
	}

	const onDurationChanged = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		changeDuration(trackIdx, noteIdx, duration)
	}

	const [settings, setSettings] = createSignal<Partial<KeyboardSettings>>({
		baseNote: toMidi('C3'),
		scaleHighlight: ScaleHighlight.Major,
		toneColorType: ToneColorType.CircleOfFiths,
	})

	const activeNote = () => {
		const idx = activeNoteIdx()
		return idx ? song()[idx[0]]?.notes[idx[1]] : null
	}

	return (
		<div>
			<div class="relative h-[620px] w-[620px] max-w-full shadow-md">
				<div class="absolute bottom-0 left-0 right-0 top-0 overflow-scroll">
					<Keyboard
						activeNotes={
							activeNote() ? activeNote().midiNotes : synth.playingNotes()
						}
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
					song={song()}
					isPlaying={isPlaying()}
					activeNoteIdx={activeNoteIdx()}
					onPlay={onPlay}
					onNoteClicked={onNoteClicked}
					onRemove={onNoteRemoved}
					onAddBefore={onNoteAddedBefore}
					onAddAfter={onNoteAddedAfter}
					onDurationChanged={onDurationChanged}
				/>
			</div>
		</div>
	)
}

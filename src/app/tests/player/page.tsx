'use client'

import { Keyboard, KeyboardSettings } from '@/components/keyboard'
import { Track, TrackMode } from '@/components/track'
import { MelodyNote, useMelody } from '@/utils/melody'
import { useSynth } from '@/utils/synth'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { toMidi } from '@/utils/utils'
import { useState } from 'react'
import { Subdivision } from 'tone/build/esm/core/type/Units'

const initialMelody: MelodyNote[] = [
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

	const { melody, addNote, removeNote, changeDuration, updateNoteTones } =
		useMelody(initialMelody)

	const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null)

	const onActivateNote = (midi: number) => {
		if (activeNoteIdx !== null) {
			const note = melody.notes[activeNoteIdx]
			if (!note.midiNotes.includes(midi)) {
				const newNotes = [...note.midiNotes, midi]
				updateNoteTones(activeNoteIdx, newNotes)
				synth.play(newNotes, note.duration)
			} else {
				synth.play(note.midiNotes, note.duration)
			}
		} else {
			synth.play([midi])
		}
	}

	const onDeactivateNote = (midi: number) => {
		if (activeNoteIdx !== null) {
			const note = melody.notes[activeNoteIdx]
			if (note.midiNotes.includes(midi)) {
				const newNotes = note.midiNotes.filter((n) => n !== midi)
				updateNoteTones(activeNoteIdx, newNotes)
				synth.play(newNotes, note.duration)
			} else {
				synth.play(note.midiNotes, note.duration)
			}
		} else {
			synth.stop([midi])
		}
	}

	const onNoteClicked = (idx: number) => {
		if (activeNoteIdx === idx) {
			setActiveNoteIdx(null)
		} else {
			setActiveNoteIdx(idx)
			const note = melody.notes[idx]
			synth.play(note.midiNotes, note.duration)
		}
	}

	const onNoteAddedBefore = (
		idx: number,
		duration: Subdivision | Subdivision[],
	) => {
		addNote(idx, { duration, midiNotes: [] })
	}

	const onNoteAddedAfter = (
		idx: number,
		duration: Subdivision | Subdivision[],
	) => {
		addNote(idx + 1, { duration, midiNotes: [] })
		onNoteClicked(idx + 1)
	}

	const onNoteRemoved = (idx: number) => {
		if (idx === melody.notes.length - 1) {
			if (melody.notes.length > 1) {
				setActiveNoteIdx(idx - 1)
			} else {
				setActiveNoteIdx(null)
			}
		}
		removeNote(idx)
	}

	const onDurationChanged = (
		idx: number,
		duration: Subdivision | Subdivision[],
	) => {
		changeDuration(idx, duration)
	}

	const [settings, setSettings] = useState<Partial<KeyboardSettings>>({
		baseNote: toMidi('C3'),
		scaleHighlight: ScaleHighlight.Major,
		toneColorType: ToneColorType.CircleOfFiths,
	})

	return (
		<div>
			<div className="relative h-[620px] w-[620px] max-w-full shadow-md">
				<div className="absolute bottom-0 left-0 right-0 top-0 overflow-scroll">
					<Keyboard
						activeNotes={
							activeNoteIdx !== null
								? melody.notes[activeNoteIdx].midiNotes
								: synth.playingNotes
						}
						onNoteActivated={onActivateNote}
						onNoteDeactivated={onDeactivateNote}
						onSettingsChanged={setSettings}
						settings={{
							...settings,
							mode: activeNoteIdx !== null ? 'Record' : 'Play',
						}}
					/>
				</div>
			</div>
			<div className="mt-2">
				<Track
					mode={activeNoteIdx !== null ? TrackMode.Edit : TrackMode.Play} // TODO: keep track of playing state
					melody={melody}
					activeNoteIdx={activeNoteIdx}
					onNoteClicked={onNoteClicked}
					onRemove={onNoteRemoved}
					onAddBefore={onNoteAddedBefore}
					onAddAfter={onNoteAddedAfter}
					onDurationChanged={onDurationChanged}
				></Track>
			</div>
		</div>
	)
}

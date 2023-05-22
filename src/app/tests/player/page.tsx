'use client'

import { Keyboard, KeyboardSettings } from '@/components/keyboard'
import { Track } from '@/components/track'
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

	const onActivateNote = (midi: number) => {
		synth.play([midi])
	}

	const onDeactivateNote = (midi: number) => {
		synth.stop([midi])
	}

	const { melody, addNote, removeNote, changeDuration } =
		useMelody(initialMelody)

	const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null)

	const onNoteClicked = (idx: number) => {
		if (activeNoteIdx === idx) {
			setActiveNoteIdx(null)
		} else {
			setActiveNoteIdx(idx)
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
		mode: 'Play',
	})

	return (
		<div>
			<div className="relative h-[620px] w-[620px] max-w-full shadow-md">
				<div className="absolute bottom-2 left-2 right-2 top-2 overflow-scroll">
					<Keyboard
						activeNotes={synth.playingNotes}
						onNoteActivated={onActivateNote}
						onNoteDeactivated={onDeactivateNote}
						onSettingsChanged={setSettings}
						settings={settings}
					/>
				</div>
			</div>
			<div className="mt-2">
				<Track
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

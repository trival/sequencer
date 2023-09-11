'use client'

import { Track } from '@/components/track'
import { TrackNote, useSong } from '@/utils/melody'
import { toMidi } from '@/utils/utils'
import { useState } from 'react'
import { Subdivision } from 'tone/build/esm/core/type/Units'

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

export default function EditorPage() {
	const { song, addNote, removeNote, changeDuration } = useSong({
		bpm: 160,
		tracks: [initialMelody],
	})

	const [activeNoteIdx, setActiveNoteIdx] = useState<[number, number] | null>(
		null,
	)
	const [isPlaying, setIsPlaying] = useState(false)

	const onNoteClicked = (trackIdx: number, noteIdx: number) => {
		console.log('onNoteClicked', trackIdx, noteIdx)
		if (
			activeNoteIdx &&
			activeNoteIdx[0] === trackIdx &&
			activeNoteIdx[1] === noteIdx
		) {
			setActiveNoteIdx(null)
		} else {
			setActiveNoteIdx([trackIdx, noteIdx])
		}
	}

	const onNoteAddedBefore = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		console.log('onNoteAddedBefore', trackIdx, noteIdx)
		addNote(trackIdx, noteIdx, { duration, midiNotes: [] })
	}

	const onNoteAddedAfter = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		console.log('onNoteAddedAfter', trackIdx, noteIdx)
		addNote(trackIdx, noteIdx + 1, { duration, midiNotes: [] })
		onNoteClicked(trackIdx, noteIdx + 1)
	}

	const onNoteRemoved = (trackIdx: number, noteIdx: number) => {
		console.log('onNoteRemoved', trackIdx, noteIdx)
		removeNote(trackIdx, noteIdx)
	}

	const onDurationChanged = (
		trackIdx: number,
		noteIdx: number,
		duration: Subdivision | Subdivision[],
	) => {
		console.log('onDurationChanged', trackIdx, noteIdx)
		changeDuration(trackIdx, noteIdx, duration)
	}

	return (
		<div className="p-10">
			<h1>Track test</h1>
			<Track
				song={song}
				isPlaying={isPlaying}
				onPlay={() => setIsPlaying(!isPlaying)}
				activeNoteIdx={activeNoteIdx}
				onNoteClicked={onNoteClicked}
				onRemove={onNoteRemoved}
				onAddBefore={onNoteAddedBefore}
				onAddAfter={onNoteAddedAfter}
				onDurationChanged={onDurationChanged}
			></Track>
		</div>
	)
}

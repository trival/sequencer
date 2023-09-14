import { Track } from '@/components/track'
import { TrackNote } from '@/datamodel'
import { useSong } from '@/utils/song'
import { toMidi } from '@/utils/utils'
import { createSignal } from 'solid-js'
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
	const { tracks, data, addNote, removeNote, changeDuration } = useSong({
		bpm: 160,
		tracks: [initialMelody],
	})

	const [activeNoteIdx, setActiveNoteIdx] = createSignal<
		[number, number] | null
	>(null)
	const [isPlaying, setIsPlaying] = createSignal(false)

	const onNoteClicked = (trackIdx: number, noteIdx: number) => {
		console.log('onNoteClicked', trackIdx, noteIdx)
		let idx = activeNoteIdx()
		if (idx && idx[0] === trackIdx && idx[1] === noteIdx) {
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
		<div class="p-10">
			<h1>Track test</h1>
			<Track
				song={tracks()}
				isPlaying={isPlaying()}
				bpm={data().bpm}
				onPlay={() => setIsPlaying(!isPlaying())}
				activeNoteIdx={activeNoteIdx()}
				onNoteClicked={onNoteClicked}
				onRemove={onNoteRemoved}
				onAddBefore={onNoteAddedBefore}
				onAddAfter={onNoteAddedAfter}
				onDurationChanged={onDurationChanged}
			/>
		</div>
	)
}

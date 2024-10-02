import { SongControls } from '@/components/songControls'
import { Track } from '@/components/track'
import { SongEntity, Subdivision, TrackNote } from '@/datamodel'
import { processSong } from '@/utils/processedTrack'
import { createSongActions, emptySong } from '@/utils/song'
import { toMidi } from '@/utils/utils'
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

const defaultDuration = '4n'

export default function TestTracksPage() {
	const [song, setSong] = createSignal({
		...emptySong(),
		bpm: 160,
		tracks: [{ notes: initialMelody, instrument: 0 }],
	})

	const { addNote, removeNote, changeDuration } = createSongActions(
		song,
		setSong,
	)

	const [activeNoteIdx, setActiveNoteIdx] = createSignal<
		[number, number] | null
	>(null)
	const [isPlaying, setIsPlaying] = createSignal(false)

	const onNoteClicked = (trackIdx: number, noteIdx: number) => {
		console.log('onNoteClicked', trackIdx, noteIdx)
		const idx = activeNoteIdx()
		if (idx && idx[0] === trackIdx && idx[1] === noteIdx) {
			setActiveNoteIdx(null)
		} else {
			setActiveNoteIdx([trackIdx, noteIdx])
		}
	}

	const onNoteAddedBefore = (trackIdx: number, noteIdx: number) => {
		console.log('onNoteAddedBefore', trackIdx, noteIdx)
		addNote(trackIdx, noteIdx, { duration: defaultDuration, midiNotes: [] })
	}

	const onNoteAddedAfter = (trackIdx: number, noteIdx: number) => {
		console.log('onNoteAddedAfter', trackIdx, noteIdx)
		addNote(trackIdx, noteIdx + 1, { duration: defaultDuration, midiNotes: [] })
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

	const tracks = () => processSong(song())
	const activeNotes = () => {
		const idx = activeNoteIdx()
		if (idx) {
			return [idx]
		}
		return []
	}

	return (
		<div class="p-10">
			<h1>Track test</h1>
			<Track
				tracks={tracks()}
				activeNoteIds={activeNotes()}
				onNoteClicked={onNoteClicked}
			/>
			<SongControls
				songEntity={{ data: { song: song() } } as SongEntity}
				defaultDuration={defaultDuration}
				isPlaying={isPlaying()}
				onPlay={() => setIsPlaying(!isPlaying())}
				onStop={() => {
					setIsPlaying(false)
					setActiveNoteIdx(null)
				}}
				activeNoteIds={activeNotes()}
				onRemove={onNoteRemoved}
				onAddBefore={onNoteAddedBefore}
				onAddAfter={onNoteAddedAfter}
				onDurationChanged={onDurationChanged}
			/>
		</div>
	)
}

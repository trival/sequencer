import { toMidi } from '@/utils/utils'
import { TrackNote } from '@/datamodel'
import Player from '@/components/player'

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
	return (
		<Player
			song={{ bpm: 160, tracks: [initialMelody] }}
			onSave={(song) => {
				console.log(song)
			}}
		/>
	)
}

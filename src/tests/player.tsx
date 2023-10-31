import { toMidi } from '@/utils/utils'
import { TrackNote } from '@/datamodel'
import PlayerUI from '@/components/player'
import { songFromMelody } from '@/utils/song'
import { createSynth } from '@/utils/synth'
import { createPlayer } from '@/utils/songPlayer'

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
	const song = songFromMelody(initialMelody).data
	song.bpm = 160

	const synth = createSynth()
	const player = createPlayer(synth)

	return (
		<PlayerUI
			song={song}
			onSave={(song) => {
				console.log(song)
			}}
			songPlayer={player}
			synth={synth}
		/>
	)
}

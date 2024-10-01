import PlayerUI from '@/components/player'
import {
	defaultEditorSettings,
	defaultKeyboardSettings,
	SongEntity,
	TrackNote,
} from '@/datamodel'
import { createSongActions, songFromMelody } from '@/utils/song'
import { createPlayer } from '@/utils/songPlayer'
import { createSynth } from '@/utils/synth'
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

export default function PlayerTest() {
	const [song, setSong] = createSignal({
		...songFromMelody(initialMelody),
		bpm: 160,
	})

	const synth = createSynth()
	const player = createPlayer(synth)

	const state = createSongActions(
		song,
		setSong,
		defaultEditorSettings.defaultNoteDuration,
	)

	return (
		<PlayerUI
			songEntity={{ data: { song: song() } } as SongEntity}
			songActions={state}
			onSave={() => {
				console.log('saving!', song())
			}}
			songPlayer={player}
			synth={synth}
			editorSettings={defaultEditorSettings}
			keyboardSettings={defaultKeyboardSettings}
		/>
	)
}

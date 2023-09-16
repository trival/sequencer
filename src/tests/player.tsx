import { Keyboard } from '@/components/keyboard'
import { Track } from '@/components/track'
import { ProcessedNote, useSong } from '@/utils/song'
import { useSynth } from '@/utils/synth'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { toMidi } from '@/utils/utils'
import { Subdivision } from 'tone/build/esm/core/type/Units'
import * as Tone from 'tone'
import { createSignal } from 'solid-js'
import { KeyboardSettings, Song, TrackNote } from '@/datamodel'
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

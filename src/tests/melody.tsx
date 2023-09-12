import { TrackNote, ProcessedNote, useSong } from '@/utils/song'
import { useSynth } from '@/utils/synth'
import { toMidi } from '@/utils/utils'
import * as Tone from 'tone'

const melodyData: TrackNote[] = [
	{ midiNotes: [toMidi('C4'), toMidi('E4'), toMidi('G4')], duration: '4n' },
	{ midiNotes: [toMidi('C4'), toMidi('E4'), toMidi('G4')], duration: '2n' },
	{ midiNotes: [toMidi('C4'), toMidi('E4'), toMidi('G4')], duration: '4n' },

	{ midiNotes: [toMidi('F4'), toMidi('A4'), toMidi('C4')], duration: '4n' },
	{ midiNotes: [toMidi('F4'), toMidi('A4'), toMidi('C4')], duration: '2n' },
	{ midiNotes: [toMidi('F4'), toMidi('A4'), toMidi('C4')], duration: '4n' },

	{ midiNotes: [toMidi('G4'), toMidi('B4'), toMidi('D4')], duration: '4n' },
	{ midiNotes: [toMidi('G4'), toMidi('B4'), toMidi('D4')], duration: '2n' },
	{ midiNotes: [toMidi('G4'), toMidi('B4'), toMidi('D4')], duration: '4n' },

	{
		midiNotes: [toMidi('C4'), toMidi('E4'), toMidi('G4')],
		duration: ['4n', '8t'],
	},
	{ midiNotes: [toMidi('C4'), toMidi('E4'), toMidi('G4')], duration: ['8t'] },
	{ midiNotes: [toMidi('C4'), toMidi('E4'), toMidi('G4')], duration: ['8t'] },
	{ midiNotes: [], duration: '4n.' },
	{ midiNotes: [toMidi('C5')], duration: '8n' },
]

export default function SequenceTest() {
	const synth = useSynth()
	const { song } = useSong({ bpm: 160, tracks: [melodyData] })

	const onClick = async () => {
		await Tone.start()
		Tone.Transport.start()
		Tone.Transport.bpm.value = 160

		let track = song()[0]

		const seq = new Tone.Part((time, note: ProcessedNote) => {
			synth.play(note.midiNotes, note.duration, time)
		}, track.notes)

		seq.loop = 2
		seq.loopEnd = track.duration
		seq.start()
	}

	return (
		<button class="m-8 bg-slate-400 px-4 py-2" onClick={onClick}>
			Play
		</button>
	)
}

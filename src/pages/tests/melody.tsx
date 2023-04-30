import { MelodyNote, PartNote, toPartValues } from '@/utils/melody'
import { useSynth } from '@/utils/synth'
import { toMidi } from '@/utils/utils'
import * as Tone from 'tone'

const melody: MelodyNote[] = [
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

const partVals = toPartValues(melody)

export default function SequenceTest() {
	const synth = useSynth()
	const onClick = async () => {
		await Tone.start()

		Tone.Transport.start()
		Tone.Transport.bpm.value = 160

		const seq = new Tone.Part((time, note: PartNote) => {
			synth.play(note.midiNotes, note.duration, time)
		}, partVals.partNotes)

		seq.loop = 2
		seq.loopEnd = partVals.duration
		seq.start()
	}

	return (
		<button className="py-2 px-4 m-8 bg-slate-400" onClick={onClick}>
			Play
		</button>
	)
}

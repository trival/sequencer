import { Note } from 'tone/build/esm/core/type/NoteUnits'
import * as Tone from 'tone'
import { Subdivision } from 'tone/build/esm/core/type/Units'

export function defined<T>(value: T | undefined | null): value is T {
	return value != null
}

export const toMidi = (note: Note) => Tone.Frequency(note).toMidi()
export const fromMidi = (midi: number) => Tone.Frequency(midi, 'midi')

export const subdivisions: Subdivision[] = [
	'1m',
	'1n',
	'1n.',
	'2n',
	'2n.',
	'2t',
	'4n',
	'4n.',
	'4t',
	'8n',
	'8n.',
	'8t',
	'16n',
	'16n.',
	'16t',
	'32n',
	'32n.',
	'32t',
]

export const divideAt = <T>(xs: T[], idx: number): [T[], T[]] => {
	return [xs.slice(0, idx), xs.slice(idx)]
}

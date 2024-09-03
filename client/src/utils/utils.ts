import { Note } from 'tone/build/esm/core/type/NoteUnits'
import * as Tone from 'tone'

export function defined<T>(value: T | undefined | null): value is T {
	return value != null
}

export const toMidi = (note: Note) => Tone.Frequency(note).toMidi()
export const fromMidi = (midi: number) => Tone.Frequency(midi, 'midi')

export const divideAt = <T>(xs: T[], idx: number): [T[], T[]] => {
	return [xs.slice(0, idx), xs.slice(idx)]
}

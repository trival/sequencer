import { Note } from 'tone/build/esm/core/type/NoteUnits'
import * as Tone from 'tone'

export const toMidi = (note: Note) => Tone.Frequency(note).toMidi()
export const fromMidi = (midi: number) => Tone.Frequency(midi, 'midi')

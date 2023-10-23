import { SongData } from '@/datamodel'
import { ProcessedNote, processSong } from './processedTrack'
import { SynthPlayer } from './synth'
import { createSignal } from 'solid-js'
import * as Tone from 'tone'

export interface SongPlayer {
	play: (offsetSec?: number) => void
	playNote: (trackIdx: number, noteIdx: number) => void
	stop: () => void
	playingNotes: () => [trackIdx: number, noteIdx: number][]
}

export function createPlayer(song: SongData, synth: SynthPlayer): SongPlayer {
	const tracks = processSong(song)

	const [playingNotes, setPlayingNotes] = createSignal<
		[trackIdx: number, noteIdx: number][]
	>([])

	const [playingSequences, setPlayingSequences] = createSignal<
		Tone.Part<ProcessedNote>[] | null
	>(null)

	const play = async (offset?: number) => {
		Tone.Transport.start()

		const seqs = tracks.map((track, trackIdx) => {
			const trackData = song.tracks[trackIdx]
			const seq = new Tone.Part((time, note: ProcessedNote) => {
				synth.play(trackData.instrument, note.midiNotes, note.duration, time)
				setPlayingNotes((ns) =>
					ns
						.filter((n) => n[0] !== trackIdx)
						.concat([trackIdx, track.notes.indexOf(note)]),
				)
			}, track.notes)
			seq.loop = true
			seq.loopEnd = track.duration
			return seq
		})

		if (offset) {
			seqs.forEach((seq, i) => {
				const track = tracks[i]
				seq.start(0, offset % track.durationSec)
			})
		} else {
			seqs.forEach((seq) => {
				seq.start()
			})
		}

		setPlayingSequences(seqs)
	}

	const stop = () => {
		playingSequences()?.forEach((seq) => {
			seq.stop()
		})

		Tone.Transport.stop()
		setPlayingSequences(null)
		setPlayingNotes([])
	}

	const playNote = (trackIdx: number, noteIdx: number) => {
		const track = tracks[trackIdx]
		const note = track.notes[noteIdx]
		synth.play(song.tracks[trackIdx].instrument, note.midiNotes, note.duration)
	}

	return { play, stop, playingNotes, playNote }
}

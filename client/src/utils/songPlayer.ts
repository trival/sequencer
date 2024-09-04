import { Song } from '@/datamodel'
import { ProcessedNote, processSong } from './processedTrack'
import { SynthPlayer } from './synth'
import { createSignal } from 'solid-js'
import * as Tone from 'tone'

export interface SongPlayer {
	play: (
		song: Song,
		startAt?: [trackIdx: number, noteIdx: number],
		selectTracks?: number[],
	) => void
	playNote: (song: Song, trackIdx: number, noteIdx: number) => void
	stop: () => void
	playingNotes: () => [trackIdx: number, noteIdx: number][]
}

export function createPlayer(synth: SynthPlayer): SongPlayer {
	const [playingNotes, setPlayingNotes] = createSignal<
		[trackIdx: number, noteIdx: number][]
	>([])

	const [playingSequences, setPlayingSequences] = createSignal<
		Tone.Part<ProcessedNote>[] | null
	>(null)

	const play = async (song: Song, startNoteIdx?: [number, number]) => {
		Tone.getTransport().stop()
		Tone.getTransport().cancel()
		Tone.getTransport().start()

		const tracks = processSong(song)

		Tone.getTransport().bpm.value = song.bpm

		let offset = 0
		if (startNoteIdx !== undefined) {
			const [tIdx, nIdx] = startNoteIdx
			offset = tracks[tIdx]?.notes[nIdx]?.startTimeSec || 0
		}

		const seqs = tracks.map((track, trackIdx) => {
			const trackData = song.tracks[trackIdx]
			const seq = new Tone.Part(
				(time, note: ProcessedNote) => {
					synth.play(trackData.instrument, note.midiNotes, note.duration, time)
					setPlayingNotes((ns) =>
						ns
							.filter((n) => n[0] !== trackIdx)
							.concat([
								[
									trackIdx,
									track.notes.findIndex(
										(n) => n.startTimeSec === note.startTimeSec,
									),
								],
							]),
					)
				},
				track.notes.map((n) => ({ ...n, time: n.startTimeSec })),
			)
			seq.loop = true
			seq.loopEnd = track.durationSec
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
		console.log('called stop!')
		playingSequences()?.forEach((seq) => {
			seq.stop()
		})

		Tone.getTransport().stop()
		Tone.getTransport().cancel()
		setPlayingSequences(null)
		setPlayingNotes([])
	}

	const playNote = (song: Song, trackIdx: number, noteIdx: number) => {
		const tracks = processSong(song)
		const track = tracks[trackIdx]
		const note = track.notes[noteIdx]
		synth.play(song.tracks[trackIdx].instrument, note.midiNotes, note.duration)
	}

	return { play, stop, playingNotes, playNote }
}

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createSignal } from 'solid-js'

export interface MidiDevice {
	id: string
	name: string
	manufacturer: string
}

let midiAccess: MIDIAccess | null = null
const [midiOutputs, setMidiOutputs] = createSignal<MidiDevice[]>([])
const [midiInitialized, setMidiInitialized] = createSignal(false)
const [midiSupported, setMidiSupported] = createSignal(true)

/**
 * Initialize Web MIDI API access and populate available outputs
 * @internal - Use createMidiOutput().init() instead
 */
async function initMIDI() {
	if (!navigator.requestMIDIAccess) {
		console.warn('Web MIDI is not supported in this browser.')
		setMidiSupported(false)
		return false
	}

	try {
		midiAccess = await navigator.requestMIDIAccess({ sysex: false })
		populateOutputs()
		// Listen for devices being added/removed while the page is open
		midiAccess.onstatechange = populateOutputs
		setMidiInitialized(true)
		return true
	} catch (err) {
		console.error('Could not get MIDI access – ', err)
		setMidiSupported(false)
		return false
	}
}

/**
 * Populate the list of available MIDI output devices
 */
function populateOutputs() {
	if (!midiAccess) return

	const devices: MidiDevice[] = []
	midiAccess.outputs.forEach((port) =>
		devices.push({
			id: port.id,
			name: port.name || 'Unknown Device',
			manufacturer: port.manufacturer || '',
		}),
	)

	setMidiOutputs(devices)
}

/**
 * Get the current list of available MIDI output devices
 */
export function getMidiOutputs() {
	return midiOutputs
}

/**
 * Check if MIDI is initialized
 */
export function isMidiInitialized() {
	return midiInitialized
}

/**
 * Check if MIDI is supported in the current browser
 */
export function isMidiSupported() {
	return midiSupported
}

/**
 * Creates a MIDI output manager with synth-like interface
 * Handles device selection, note tracking, and MIDI message sending
 */
export function createMidiOutput() {
	const [deviceId, setDeviceId] = createSignal<string | undefined>()

	// Track active notes per channel (16 channels, 0-15)
	const activeNotesPerChannel: Set<number>[] = Array.from(
		{ length: 16 },
		() => new Set<number>(),
	)

	const [playingNotes, setPlayingNotes] = createSignal<number[][]>(
		activeNotesPerChannel.map((set) => Array.from(set)),
	)

	/**
	 * Play notes on a specific MIDI channel
	 * @param channel MIDI channel (0-15)
	 * @param notes Array of MIDI note numbers to play
	 * @param velocity Note velocity (0-127), defaults to 127
	 */
	const play = (channel: number, notes: number[], velocity: number = 127) => {
		const currentDeviceId = deviceId()
		if (!currentDeviceId || !midiAccess) {
			return
		}

		// @ts-ignore
		const midiOut = midiAccess.outputs.get(currentDeviceId)
		if (!midiOut) {
			console.warn(`No MIDI output found with ID: ${currentDeviceId}`)
			return
		}

		const channelIdx = channel & 0x0f
		const NOTE_ON = 0x90 | channelIdx

		// Send Note On for each note
		notes.forEach((note) => {
			midiOut.send([NOTE_ON, note & 0x7f, velocity & 0x7f])
			activeNotesPerChannel[channelIdx].add(note)
		})

		// Update playing notes signal
		setPlayingNotes(activeNotesPerChannel.map((set) => Array.from(set)))
	}

	/**
	 * Stop notes on a specific MIDI channel
	 * @param channel MIDI channel (0-15)
	 * @param notes Array of MIDI note numbers to stop
	 */
	const stop = (channel: number, notes: number[]) => {
		const currentDeviceId = deviceId()
		if (!currentDeviceId || !midiAccess) {
			return
		}

		// @ts-ignore
		const midiOut = midiAccess.outputs.get(currentDeviceId)
		if (!midiOut) {
			console.warn(`No MIDI output found with ID: ${currentDeviceId}`)
			return
		}

		const channelIdx = channel & 0x0f
		const NOTE_OFF = 0x80 | channelIdx

		// Send Note Off for each note
		notes.forEach((note) => {
			midiOut.send([NOTE_OFF, note & 0x7f, 0])
			activeNotesPerChannel[channelIdx].delete(note)
		})

		// Update playing notes signal
		setPlayingNotes(activeNotesPerChannel.map((set) => Array.from(set)))
	}

	return {
		play,
		stop,
		playingNotes,
		deviceId,
		setDeviceId,
		init: initMIDI,
	}
}

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
 */
export async function initMIDI() {
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
 * Send a MIDI Note On message
 * @param deviceId The ID of the MIDI output device
 * @param channel MIDI channel (0-15)
 * @param noteNumber MIDI note number (0-127)
 * @param velocity Note velocity (0-127)
 */
export function sendNoteOn(
	deviceId: string,
	channel: number,
	noteNumber: number,
	velocity: number,
) {
	if (!midiAccess) {
		console.warn('MIDI not initialized. Call initMIDI() first.')
		return
	}

	// @ts-ignore
	const midiOut = midiAccess.outputs.get(deviceId)
	if (!midiOut) {
		console.warn(`No MIDI output found with ID: ${deviceId}`)
		return
	}

	// 0x90 = Note On, channel is added to the status byte
	const NOTE_ON = 0x90 | (channel & 0x0f)
	midiOut.send([NOTE_ON, noteNumber & 0x7f, velocity & 0x7f])
}

/**
 * Send a MIDI Note Off message
 * @param deviceId The ID of the MIDI output device
 * @param channel MIDI channel (0-15)
 * @param noteNumber MIDI note number (0-127)
 * @param velocity Note off velocity (0-127)
 */
export function sendNoteOff(
	deviceId: string,
	channel: number,
	noteNumber: number,
	velocity: number = 0,
) {
	if (!midiAccess) {
		console.warn('MIDI not initialized. Call initMIDI() first.')
		return
	}

	// @ts-ignore
	const midiOut = midiAccess.outputs.get(deviceId)
	if (!midiOut) {
		console.warn(`No MIDI output found with ID: ${deviceId}`)
		return
	}

	// 0x80 = Note Off, channel is added to the status byte
	const NOTE_OFF = 0x80 | (channel & 0x0f)
	midiOut.send([NOTE_OFF, noteNumber & 0x7f, velocity & 0x7f])
}

import { Keyboard } from '@/components/keyboard'
import { KeyboardSettingsBtn } from '@/components/keyboardSettings'
import { MidiSettingsBtn } from '@/components/midiSettings'
import { Subpage } from '@/components/shared/simpleSubpage'
import { defaultKeyboardSettings } from '@/datamodel'
import { createLocalStorageKeyboardSettings } from '@/utils/localStorageSettings'
import { createSynth } from '@/utils/synth'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { toMidi } from '@/utils/utils'
import { createMidiOutput } from '@/utils/webmidi'
import { createMemo, createSignal, onMount } from 'solid-js'

export default function KeyboardPage() {
	const synth = createSynth()
	const midi = createMidiOutput()

	// MIDI state - local to KeyboardPage only
	const [midiEnabled, setMidiEnabled] = createSignal(false)
	const [midiChannel, setMidiChannel] = createSignal(0)

	// Initialize MIDI on component mount
	onMount(() => {
		midi.init()
	})

	const isMidiActive = createMemo(() => midiEnabled() && midi.deviceId())

	const onActivateNote = (note: number) => {
		if (isMidiActive()) {
			midi.play(midiChannel(), [note])
		} else {
			synth.play(0, [note])
		}
	}

	const onDeactivateNote = (note: number) => {
		if (isMidiActive()) {
			midi.stop(midiChannel(), [note])
		} else {
			synth.stop(0, [note])
		}
	}

	const { settings, updateSettings } = createLocalStorageKeyboardSettings({
		...defaultKeyboardSettings,
		baseNote: toMidi('C3'),
		scaleHighlight: ScaleHighlight.Major,
		toneColorType: ToneColorType.CircleOfFiths,
	})

	return (
		<Subpage
			navOpts={
				<span class="flex gap-2">
					<KeyboardSettingsBtn
						settings={settings()}
						onSettingsUpdate={updateSettings}
					/>
					<MidiSettingsBtn
						midiEnabled={midiEnabled}
						setMidiEnabled={setMidiEnabled}
						midiDeviceId={midi.deviceId}
						setMidiDeviceId={midi.setDeviceId}
						midiChannel={midiChannel}
						setMidiChannel={setMidiChannel}
						midiOutputs={midi.outputs}
						isMidiSupported={midi.isSupported}
					/>
				</span>
			}
		>
			<div class="z-0 flex h-[calc(100%-2rem)] w-full justify-center lg:h-[calc(100%-3.5rem)]">
				<Keyboard
					activeNotes={
						isMidiActive()
							? midi.playingNotes().flatMap((n) => n.map((note) => ({ note })))
							: synth.playingNotes().flatMap((n) => n.map((note) => ({ note })))
					}
					onNoteActivated={onActivateNote}
					onNoteDeactivated={onDeactivateNote}
					settings={settings()}
					mode="Play"
				/>
			</div>
		</Subpage>
	)
}

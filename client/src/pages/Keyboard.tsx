import { Keyboard } from '@/components/keyboard'
import { KeyboardSettingsBtn } from '@/components/keyboardSettings'
import { IconButton } from '@/components/shared/buttons'
import { Input, Select } from '@/components/shared/input'
import Popover from '@/components/shared/popover'
import { Subpage } from '@/components/shared/simpleSubpage'
import { defaultKeyboardSettings, KeyboardSettings } from '@/datamodel'
import { createSynth } from '@/utils/synth'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { toMidi } from '@/utils/utils'
import {
	getMidiOutputs,
	initMIDI,
	isMidiSupported,
	sendNoteOff,
	sendNoteOn,
} from '@/utils/webmidi'
import { Icon } from 'solid-heroicons'
import { musicalNote } from 'solid-heroicons/outline'
import { createSignal, onMount, Show } from 'solid-js'

// MIDI Settings Component
interface MidiSettingsProps {
	midiEnabled: () => boolean
	setMidiEnabled: (enabled: boolean) => void
	midiDeviceId: () => string | undefined
	setMidiDeviceId: (id: string | undefined) => void
	midiChannel: () => number
	setMidiChannel: (channel: number) => void
}

function MidiSettingsBtn(props: MidiSettingsProps) {
	const [isOpen, setOpen] = createSignal(false)

	const close = () => setOpen(false)
	const open = () => setOpen(true)
	let btnRef: HTMLButtonElement | undefined

	return (
		<>
			<IconButton
				ref={btnRef}
				onClick={open}
				color="custom"
				title="MIDI settings"
			>
				<Icon path={musicalNote} class="h-6 w-6" />
			</IconButton>
			<Popover
				popperOptions={{
					placement: 'right-start',
					modifiers: [{ name: 'offset', options: { offset: [40, 6] } }],
				}}
				referenceElement={btnRef as HTMLButtonElement}
				onClose={close}
				visible={isOpen()}
				class="rounded bg-gray-100/90 shadow-md shadow-gray-500/60"
			>
				<div class="p-4">
					<Show when={!isMidiSupported()}>
						<div class="mb-3 text-sm text-red-600">
							Web MIDI is not supported in this browser
						</div>
					</Show>
					<label class="mb-3 flex items-center">
						<input
							type="checkbox"
							checked={props.midiEnabled()}
							onChange={(e) => props.setMidiEnabled(e.target.checked)}
							class="mr-2 h-4 w-4"
							disabled={!isMidiSupported()}
						/>
						<span class="text-sm">Enable MIDI Output</span>
					</label>
					<Show when={props.midiEnabled()}>
						<Select
							class="mb-3 w-64"
							label="MIDI Device"
							value={props.midiDeviceId() || ''}
							onSelect={(value) => props.setMidiDeviceId(value as string)}
							options={getMidiOutputs()().map((device) => ({
								value: device.id,
								label: `${device.manufacturer} ${device.name}`.trim(),
							}))}
						/>
						<label class="flex items-center text-sm">
							MIDI Channel
							<Input
								type="number"
								class="ml-2 w-20 px-2"
								value={props.midiChannel() + 1}
								onChange={(value) => {
									const ch = parseInt(value as string) - 1
									props.setMidiChannel(Math.max(0, Math.min(15, ch)))
								}}
							/>
						</label>
					</Show>
				</div>
			</Popover>
		</>
	)
}

export default function KeyboardPage() {
	const synth = createSynth()

	// MIDI state - local to KeyboardPage only
	const [midiEnabled, setMidiEnabled] = createSignal(false)
	const [midiDeviceId, setMidiDeviceId] = createSignal<string | undefined>()
	const [midiChannel, setMidiChannel] = createSignal(0)

	// Track active MIDI notes
	const activeMidiNotesSet = new Set<number>()
	const [activeMidiNotes, setActiveMidiNotes] = createSignal<number[]>([])

	// Initialize MIDI on component mount
	onMount(() => {
		initMIDI()
	})

	const onActivateNote = (midi: number) => {
		if (midiEnabled() && midiDeviceId()) {
			sendNoteOn(midiDeviceId()!, midiChannel(), midi, 127)
			activeMidiNotesSet.add(midi)
			setActiveMidiNotes([...activeMidiNotesSet])
		} else {
			synth.play(0, [midi])
		}
	}

	const onDeactivateNote = (midi: number) => {
		if (midiEnabled() && midiDeviceId()) {
			sendNoteOff(midiDeviceId()!, midiChannel(), midi, 0)
			activeMidiNotesSet.delete(midi)
			setActiveMidiNotes([...activeMidiNotesSet])
		} else {
			synth.stop(0, [midi])
		}
	}

	const [settings, setSettings] = createSignal({
		...defaultKeyboardSettings,
		baseNote: toMidi('C3'),
		scaleHighlight: ScaleHighlight.Major,
		toneColorType: ToneColorType.CircleOfFiths,
	} as KeyboardSettings)

	return (
		<Subpage
			navOpts={
				<>
					<KeyboardSettingsBtn
						settings={settings()}
						onSettingsUpdate={(newSettings) =>
							setSettings((old) => ({ ...old, ...newSettings }))
						}
					/>
					<MidiSettingsBtn
						midiEnabled={midiEnabled}
						setMidiEnabled={setMidiEnabled}
						midiDeviceId={midiDeviceId}
						setMidiDeviceId={setMidiDeviceId}
						midiChannel={midiChannel}
						setMidiChannel={setMidiChannel}
					/>
				</>
			}
		>
			<div class="z-0 flex h-[calc(100%-2rem)] w-full justify-center lg:h-[calc(100%-3.5rem)]">
				<Keyboard
					activeNotes={
						midiEnabled()
							? activeMidiNotes().map((note) => ({ note }))
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

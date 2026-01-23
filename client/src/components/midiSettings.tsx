import { IconButton } from '@/components/shared/buttons'
import { Input, Select } from '@/components/shared/input'
import Popover from '@/components/shared/popover'
import { getMidiOutputs, isMidiSupported } from '@/utils/webmidi'
import { Icon } from 'solid-heroicons'
import { musicalNote } from 'solid-heroicons/outline'
import { createSignal, Show } from 'solid-js'

export interface MidiSettingsProps {
	midiEnabled: () => boolean
	setMidiEnabled: (enabled: boolean) => void
	midiDeviceId: () => string | undefined
	setMidiDeviceId: (id: string | undefined) => void
	midiChannel: () => number
	setMidiChannel: (channel: number) => void
}

export function MidiSettingsBtn(props: MidiSettingsProps) {
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
				<Icon path={musicalNote} class="h-5 w-5" />
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

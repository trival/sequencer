import { defaultKeyboardSettings, KeyboardSettings } from '@/datamodel'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import { Icon } from 'solid-heroicons'
import {
	adjustmentsVertical,
	arrowSmallDown,
	arrowSmallLeft,
	arrowSmallRight,
	arrowSmallUp,
} from 'solid-heroicons/outline'
import { createEffect, createSignal } from 'solid-js'
import * as Tone from 'tone'
import { IconButton } from './shared/buttons'
import { Input, Select } from './shared/input'
import Popover from './shared/popover'

type KeyboardSettingsProps = {
	settings?: Partial<KeyboardSettings>
	onSettingsUpdate: (settings: Partial<KeyboardSettings>) => void
	class?: string
}

export function KeyboardSettingsBtn(props: KeyboardSettingsProps) {
	const [isOpen, setOpen] = createSignal(false)

	const close = () => setOpen(false)
	const open = () => setOpen(true)
	let btnRef: HTMLButtonElement | undefined

	return (
		<>
			<IconButton
				ref={btnRef}
				onClick={open}
				class={props.class}
				color="custom"
				title="Keyboard settings"
			>
				<Icon path={adjustmentsVertical} class="h-6 w-6" />
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
				<KeyboardSettingsEditor
					settings={props.settings}
					onSettingsUpdate={props.onSettingsUpdate}
				/>
			</Popover>
		</>
	)
}

function KeyboardSettingsEditor(props: KeyboardSettingsProps) {
	const [settings, setSettings] = createSignal(defaultKeyboardSettings)

	createEffect(() => {
		setSettings((settings) => ({ ...settings, ...props.settings }))
	})

	const offsetX = () => settings().offsetX
	const offsetY = () => settings().offsetY

	return (
		<div>
			<div class="flex justify-center">
				<IconButton
					class="m-3 p-1"
					onClick={() => props.onSettingsUpdate({ offsetX: offsetX() + 1 })}
				>
					<Icon path={arrowSmallLeft} class="h-6 w-6" />
				</IconButton>
				<IconButton
					class="m-3 p-1"
					onClick={() => props.onSettingsUpdate({ offsetY: offsetY() - 1 })}
				>
					<Icon path={arrowSmallUp} class="h-6 w-6" />
				</IconButton>
				<IconButton
					class="m-3 p-1"
					onClick={() => props.onSettingsUpdate({ offsetY: offsetY() + 1 })}
				>
					<Icon path={arrowSmallDown} class="h-6 w-6" />
				</IconButton>
				<IconButton
					class="m-3 p-1"
					onClick={() => props.onSettingsUpdate({ offsetX: offsetX() - 1 })}
				>
					<Icon path={arrowSmallRight} class="h-6 w-6" />
				</IconButton>
			</div>
			<div class="mx-2 mb-2 flex justify-center">
				<Select
					class="w-40"
					value={settings().scaleHighlight}
					onSelect={(value) =>
						props.onSettingsUpdate({
							scaleHighlight: value as ScaleHighlight,
						})
					}
					options={Object.entries(ScaleHighlight)
						.filter(([name]) => String(name).trim().length > 1)
						.map(([label, value]) => ({ value, label }))}
				/>
				<Select
					class="ml-2 w-20"
					value={settings().baseNote}
					onSelect={(value) =>
						props.onSettingsUpdate({
							baseNote: value as number,
						})
					}
					options={[...Array(12).keys()].map((i) => {
						const start = settings().baseNote - 4
						const note = start + i
						return {
							value: note,
							label: Tone.Frequency(note, 'midi')
								.toNote()
								.replaceAll('#', '♯')
								.replaceAll(/\d/g, ''),
						}
					})}
				/>
			</div>
			<div class="mx-2 mb-2 flex justify-center">
				<Select
					class="w-40"
					value={settings().toneColorType}
					onSelect={(value) =>
						props.onSettingsUpdate({
							toneColorType: value as ToneColorType,
						})
					}
					options={Object.entries(ToneColorType)
						.filter(([name]) => String(name).trim().length > 1)
						.map(([label, value]) => ({ value, label }))}
				/>
				<Input
					type="number"
					class="ml-2 w-20 px-2"
					value={settings().keyLength}
					onChange={(value) =>
						props.onSettingsUpdate({
							keyLength: parseInt(value as string),
						})
					}
				/>
			</div>
			<div class="mx-2 mb-2 flex justify-center">
				<label>
					w
					<Input
						type="number"
						class="ml-2 w-20 px-2"
						value={settings().maxCols}
						onChange={(value) =>
							props.onSettingsUpdate({
								maxCols: parseInt(value as string),
							})
						}
					/>
				</label>
				<label class="ml-6">
					h
					<Input
						type="number"
						class="ml-2 w-20 px-2"
						value={settings().maxRows}
						onChange={(value) =>
							props.onSettingsUpdate({
								maxRows: parseInt(value as string),
							})
						}
					/>
				</label>
			</div>
		</div>
	)
}

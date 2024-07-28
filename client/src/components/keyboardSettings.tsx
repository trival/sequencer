import {
	arrowSmallDown,
	arrowSmallLeft,
	arrowSmallRight,
	arrowSmallUp,
	adjustmentsVertical,
} from 'solid-heroicons/outline'
import { IconButton } from './shared/buttons'
import { Input, Select } from './shared/input'
import { Icon } from 'solid-heroicons'
import { createSignal } from 'solid-js'
import Popover from './shared/popover'
import { ScaleHighlight, ToneColorType } from '@/utils/tone-colors'
import * as Tone from 'tone'
import { KeyboardSettingsState } from '@/utils/settings'

type KeyboardSettingsProps = {
	state: KeyboardSettingsState
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
				<KeyboardSettingsEditor state={props.state} />
			</Popover>
		</>
	)
}

function KeyboardSettingsEditor(props: KeyboardSettingsProps) {
	const offsetX = () => props.state.data().offsetX
	const offsetY = () => props.state.data().offsetY

	return (
		<div>
			<div class="flex justify-center">
				<IconButton
					class="m-3 p-1"
					onClick={() => props.state.update({ offsetX: offsetX() + 1 })}
				>
					<Icon path={arrowSmallLeft} class="h-6 w-6" />
				</IconButton>
				<IconButton
					class="m-3 p-1"
					onClick={() => props.state.update({ offsetY: offsetY() - 1 })}
				>
					<Icon path={arrowSmallUp} class="h-6 w-6" />
				</IconButton>
				<IconButton
					class="m-3 p-1"
					onClick={() => props.state.update({ offsetY: offsetY() + 1 })}
				>
					<Icon path={arrowSmallDown} class="h-6 w-6" />
				</IconButton>
				<IconButton
					class="m-3 p-1"
					onClick={() => props.state.update({ offsetX: offsetX() - 1 })}
				>
					<Icon path={arrowSmallRight} class="h-6 w-6" />
				</IconButton>
			</div>
			<div class="mx-2 mb-2 flex justify-center">
				<Select
					class="w-40"
					value={props.state.data().scaleHighlight}
					onSelect={(value) =>
						props.state.update({
							scaleHighlight: value as ScaleHighlight,
						})
					}
					options={Object.entries(ScaleHighlight)
						.filter(([name]) => String(name).trim().length > 1)
						.map(([label, value]) => ({ value, label }))}
				/>
				<Select
					class="ml-2 w-20"
					value={props.state.data().baseNote}
					onSelect={(value) =>
						props.state.update({
							baseNote: value as number,
						})
					}
					options={[...Array(12).keys()].map((i) => {
						const start = props.state.data().baseNote - 4
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
					value={props.state.data().toneColorType}
					onSelect={(value) =>
						props.state.update({
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
					value={props.state.data().keyLength}
					onChange={(value) =>
						props.state.update({
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
						value={props.state.data().maxCols}
						onChange={(value) =>
							props.state.update({
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
						value={props.state.data().maxRows}
						onChange={(value) =>
							props.state.update({
								maxRows: parseInt(value as string),
							})
						}
					/>
				</label>
			</div>
		</div>
	)
}

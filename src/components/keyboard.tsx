import {
	ScaleHighlight,
	ToneColorType,
	ToneHighlight,
	ToneValue,
	getScaleToneColor,
	getToneBgColor,
	midiToToneValue,
	mod,
} from '@/utils/tone-colors'
import clsx from 'clsx'
import * as Tone from 'tone'
import {
	arrowSmallDown,
	arrowSmallLeft,
	arrowSmallRight,
	arrowSmallUp,
} from 'solid-heroicons/outline'
import { IconButton } from './buttons'
import { Input, Select } from './Select'
import { Icon } from 'solid-heroicons'
import {
	For,
	createEffect,
	createMemo,
	createSignal,
	mergeProps,
	onCleanup,
	onMount,
} from 'solid-js'
import Popover from './Popover'

type Mode = 'Record' | 'Play'

export interface KeyboardSettings {
	baseNote: number
	offsetX: number
	offsetY: number
	maxRows: number
	maxCols: number
	keyLength: number
	scaleHighlight: ScaleHighlight
	toneColorType: ToneColorType
}

interface KeyboardProps {
	activeNotes?: number[]
	settings: Partial<KeyboardSettings>
	onNoteActivated?: (midi: number) => void
	onNoteDeactivated?: (midi: number) => void
	onSettingsChanged?: (updatedSettings: KeyboardSettings) => void
	class?: string
	mode: Mode
}

const keyMargin = 3

const defaultSettings: KeyboardSettings = {
	baseNote: 48, // 'C3 midi number'
	offsetX: 0,
	offsetY: 0,
	maxCols: 12,
	maxRows: 12,
	keyLength: 58,
	scaleHighlight: ScaleHighlight.Major,
	toneColorType: ToneColorType.CircleOfFiths,
} as const

export const Keyboard = (_props: KeyboardProps) => {
	const props = mergeProps(
		{ activeNotes: [], onNoteActivated: () => {}, onNoteDeactivated: () => {} },
		_props,
	)

	const settings = createMemo((): KeyboardSettings => {
		return {
			...defaultSettings,
			...props.settings,
		}
	})

	const keySize = () => settings().keyLength + 2 * keyMargin

	const [pointerDown, setPointerDown] = createSignal(false)
	let wrapperRef: HTMLDivElement

	const baseFrequency = () => Tone.Frequency(settings().baseNote, 'midi')

	const notes = () => {
		return props.activeNotes.reduce(
			(acc, note) => {
				acc[note] = true
				return acc
			},
			{} as Record<number, boolean>,
		)
	}

	const toneBg = (tone: ToneValue) =>
		getToneBgColor(
			tone,
			midiToToneValue(settings().baseNote),
			settings().scaleHighlight,
			settings().toneColorType,
		)

	const isToneBgDark = (tone: ToneValue) => {
		let color = getScaleToneColor(
			tone,
			midiToToneValue(settings().baseNote),
			settings().scaleHighlight,
		)
		return color.highlight === ToneHighlight.Strong
	}

	const onPointerDown = (midi: number) => {
		setPointerDown(true)
		if (props.mode === 'Record') {
			if (notes()[midi]) {
				props.onNoteDeactivated(midi)
			} else {
				props.onNoteActivated(midi)
			}
		} else {
			props.onNoteActivated(midi)
		}
	}

	const onPointerUp = (midi: number) => {
		setPointerDown(false)
		if (props.mode === 'Play') {
			props.onNoteDeactivated(midi)
		}
	}

	const onPointerEnter = (midi: number) => {
		if (pointerDown()) {
			if (props.mode === 'Record') {
				if (notes()[midi]) {
					props.onNoteDeactivated(midi)
				} else {
					props.onNoteActivated(midi)
				}
			} else {
				props.onNoteActivated(midi)
			}
		}
	}

	const onPointerOut = (midi: number) => {
		if (pointerDown()) {
			if (props.mode === 'Play') {
				props.onNoteDeactivated(midi)
			}
		}
	}

	// compute the keys

	const [width, setWidth] = createSignal(0)
	const [height, setHeight] = createSignal(0)

	function rescale() {
		if (wrapperRef) {
			const { width: boxWidth, height: boxHeight } =
				wrapperRef.getBoundingClientRect()

			// console.log(boxHeight, wrapperRef.clientHeight, wrapperRef.offsetHeight)

			const cols = Math.min(
				Math.floor((boxWidth - 2 * keyMargin) / keySize()),
				settings().maxCols,
			)
			const rows = Math.min(
				Math.floor((boxHeight - 2 * keyMargin) / keySize()),
				settings().maxRows,
			)

			setWidth(cols)
			setHeight(rows)
		}
	}

	createEffect(rescale)

	onMount(() => {
		window.addEventListener('resize', rescale)
	})

	onCleanup(() => {
		window.removeEventListener('resize', rescale)
	})

	const base = () =>
		baseFrequency().transpose(
			-2 + settings().offsetX + (-2 + settings().offsetY) * 5,
		)

	const keys = createMemo(() => {
		const ks = []
		let rowStart = 0

		for (let i = 0; i < height(); i++) {
			const row = []

			for (let j = 0; j < width(); j++) {
				const val = rowStart + j
				const f = base().transpose(val)
				const midi = f.toMidi()
				row.push({
					frequency: f,
					midi,
					toneColor: mod(midi, 12) as ToneValue,
				})
			}

			ks.push(row)
			rowStart += 5
		}

		return ks.reverse()
	})

	return (
		<div
			ref={wrapperRef}
			class={clsx(
				props.class,
				'relative flex max-h-full max-w-full items-center justify-evenly overflow-hidden',
			)}
			style={{
				height: `${settings().maxRows * keySize() + 2 * keyMargin}px`,
				width: `${settings().maxCols * keySize() + 2 * keyMargin}px`,
			}}
		>
			{props.onSettingsChanged && (
				<KeyboardSettingsBtn
					onSettingsChanged={props.onSettingsChanged}
					currentSettings={settings()}
				/>
			)}

			<div class="flex h-full w-full flex-col justify-evenly">
				<For each={keys()}>
					{(row) => (
						<div class="flex w-full touch-none justify-evenly whitespace-nowrap">
							<For each={row}>
								{(cell) => (
									<button
										class={clsx(
											'box-border touch-none select-none rounded-md text-gray-700 shadow-sm transition-all',
											{
												'scale-110 border-4 border-red-400': notes()[cell.midi],
											},
										)}
										style={{
											'background-color': toneBg(cell.toneColor),
											width: `${settings().keyLength}px`,
											height: `${settings().keyLength}px`,
											margin: `${keyMargin}px`,
											color: isToneBgDark(cell.toneColor) ? 'black' : undefined,
										}}
										onPointerDown={(e) => {
											e.preventDefault()
											onPointerDown(cell.midi)
										}}
										onPointerUp={(e) => {
											e.preventDefault()
											onPointerUp(cell.midi)
										}}
										onPointerEnter={(e) => {
											e.preventDefault()
											onPointerEnter(cell.midi)
										}}
										onPointerOut={(e) => {
											e.preventDefault()
											onPointerOut(cell.midi)
										}}
										onContextMenu={(e) => {
											e.preventDefault()
											e.stopPropagation()
											return false
										}}
									>
										{cell.frequency.toNote().replaceAll('#', '♯')}
									</button>
								)}
							</For>
						</div>
					)}
				</For>
			</div>
		</div>
	)
}

type KeyboardSettingsProps = {
	onSettingsChanged: (updatedSettings: KeyboardSettings) => void
	currentSettings: KeyboardSettings
}

function KeyboardSettingsBtn(props: KeyboardSettingsProps) {
	const [isOpen, setOpen] = createSignal(false)

	const close = () => setOpen(false)
	const open = () => setOpen(true)
	let btnRef

	return (
		<div class="absolute left-0 top-0">
			<button
				ref={btnRef}
				type="button"
				onClick={open}
				title="Keyboard settings"
				class="w-12 h-12 rounded-full bg-gray-100/90 shadow-sm shadow-gray-400 -ml-6 -translate-y-1/2 transition-all hover:scale-110 focus:outline-none"
			/>
			<Popover
				popperOptions={{
					placement: 'right-start',
					modifiers: [{ name: 'offset', options: { offset: [40, 6] } }],
				}}
				referenceElement={btnRef}
				onClose={close}
				visible={isOpen()}
				class="rounded bg-gray-100/90 shadow-md shadow-gray-500/60"
			>
				<KeyboardSettingsEditor
					onSettingsChanged={props.onSettingsChanged}
					currentSettings={props.currentSettings}
				/>
			</Popover>
		</div>
	)
}

function KeyboardSettingsEditor(props: KeyboardSettingsProps) {
	const offsetX = () => props.currentSettings.offsetX
	const offsetY = () => props.currentSettings.offsetY

	const changeSetting = (setting: Partial<KeyboardSettings>) =>
		props.onSettingsChanged({ ...props.currentSettings, ...setting })

	return (
		<div>
			<div class="flex justify-center">
				<IconButton
					class="m-3 p-1"
					onClick={() => changeSetting({ offsetX: offsetX() + 1 })}
				>
					<Icon path={arrowSmallLeft} class="h-6 w-6" />
				</IconButton>
				<IconButton
					class="m-3 p-1"
					onClick={() => changeSetting({ offsetY: offsetY() - 1 })}
				>
					<Icon path={arrowSmallUp} class="h-6 w-6" />
				</IconButton>
				<IconButton
					class="m-3 p-1"
					onClick={() => changeSetting({ offsetY: offsetY() + 1 })}
				>
					<Icon path={arrowSmallDown} class="h-6 w-6" />
				</IconButton>
				<IconButton
					class="m-3 p-1"
					onClick={() => changeSetting({ offsetX: offsetX() - 1 })}
				>
					<Icon path={arrowSmallRight} class="h-6 w-6" />
				</IconButton>
			</div>
			<div class="mx-2 mb-2 flex justify-center">
				<Select
					class="w-40"
					value={props.currentSettings.scaleHighlight}
					onSelect={(value) =>
						props.onSettingsChanged({
							...props.currentSettings,
							scaleHighlight: parseInt(value as string) as ScaleHighlight,
						})
					}
					options={Object.entries(ScaleHighlight)
						.filter(([name]) => String(name).trim().length > 1)
						.map(([label, value]) => ({ value, label }))}
				/>
				<Select
					class="ml-2 w-20"
					value={props.currentSettings.baseNote}
					onSelect={(value) =>
						props.onSettingsChanged({
							...props.currentSettings,
							baseNote: value as number,
						})
					}
					options={[...Array(12).keys()].map((i) => {
						let start = props.currentSettings.baseNote - 4
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
					value={props.currentSettings.toneColorType}
					onSelect={(value) =>
						props.onSettingsChanged({
							...props.currentSettings,
							toneColorType: parseInt(value as string) as ToneColorType,
						})
					}
					options={Object.entries(ToneColorType)
						.filter(([name]) => String(name).trim().length > 1)
						.map(([label, value]) => ({ value, label }))}
				/>
				<Input
					type="number"
					class="ml-2 w-20 px-2"
					value={props.currentSettings.keyLength}
					onChange={(value) =>
						props.onSettingsChanged({
							...props.currentSettings,
							keyLength: parseInt(value as string),
						})
					}
				/>
			</div>
		</div>
	)
}

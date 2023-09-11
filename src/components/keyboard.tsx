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
import { chartBar } from 'solid-heroicons/solid-mini'
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
	createMemo,
	createSignal,
	mergeProps,
	onCleanup,
	onMount,
} from 'solid-js'

type Mode = 'Record' | 'Play'

export interface KeyboardSettings {
	baseNote: number
	mode: Mode
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
}

const keyMargin = 3

const defaultSettings: KeyboardSettings = {
	baseNote: 48, // 'C3 midi number'
	offsetX: 0,
	offsetY: 0,
	maxCols: 12,
	maxRows: 12,
	keyLength: 58,
	mode: 'Record',
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
		if (settings().mode === 'Record') {
			if (notes[midi]) {
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
		if (settings().mode === 'Play') {
			props.onNoteDeactivated(midi)
		}
	}

	const onPointerEnter = (midi: number) => {
		if (pointerDown) {
			if (settings().mode === 'Record') {
				if (notes[midi]) {
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
		if (pointerDown) {
			if (settings().mode === 'Play') {
				props.onNoteDeactivated(midi)
			}
		}
	}

	const stopPreventAnd = (fn: () => void) => (e: Event) => {
		e.preventDefault()
		e.stopPropagation()
		fn()
		return false
	}

	const preventAnd = (fn: () => void) => (e: Event) => {
		e.preventDefault()
		fn()
	}

	// compute the keys

	const [width, setWidth] = createSignal(0)
	const [height, setHeight] = createSignal(0)

	function rescale() {
		if (wrapperRef) {
			const { width: boxWidth, height: boxHeight } =
				wrapperRef.getBoundingClientRect()

			console.log(boxHeight, wrapperRef.clientHeight, wrapperRef.offsetHeight)

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

	onMount(() => {
		rescale()

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
				<Popover class="absolute right-0 top-0">
					<Popover.Button type="button" class="m-0">
						<Icon path={chartBar} class="h-6 w-6 -rotate-90" />
					</Popover.Button>
					<Popover.Panel class="absolute right-8 top-1 rounded bg-gray-100/90 shadow-lg shadow-gray-400">
						<KeyboardSettingsEditor
							onSettingsChanged={props.onSettingsChanged}
							currentSettings={settings()}
						/>
					</Popover.Panel>
				</Popover>
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
											{ 'scale-110 border-4 border-red-400': notes[cell.midi] },
										)}
										style={{
											'background-color': toneBg(cell.toneColor),
											width: `${settings().keyLength}px`,
											height: `${settings().keyLength}px`,
											margin: `${keyMargin}px`,
											color: isToneBgDark(cell.toneColor) ? 'black' : undefined,
										}}
										onPointerDown={preventAnd(() => onPointerDown(cell.midi))}
										onPointerUp={preventAnd(() => onPointerUp(cell.midi))}
										onPointerEnter={preventAnd(() => onPointerEnter(cell.midi))}
										onPointerOut={preventAnd(() => onPointerOut(cell.midi))}
										onContextMenu={stopPreventAnd(() => {})}
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

function KeyboardSettingsEditor(props: KeyboardSettingsProps) {
	const offsetX = () => props.currentSettings.offsetX
	const offsetY = () => props.currentSettings.offsetY

	const changeSetting = (setting: Partial<KeyboardSettings>) => () =>
		props.onSettingsChanged({ ...props.currentSettings, ...setting })

	return (
		<div>
			<div class="flex justify-center">
				<IconButton
					class="m-3 p-1"
					onClick={changeSetting({ offsetX: offsetX() + 1 })}
				>
					<Icon path={arrowSmallLeft} class="h-6 w-6" />
				</IconButton>
				<IconButton
					class="m-3 p-1"
					onClick={changeSetting({ offsetY: offsetY() - 1 })}
				>
					<Icon path={arrowSmallUp} class="h-6 w-6" />
				</IconButton>
				<IconButton
					class="m-3 p-1"
					onClick={changeSetting({ offsetY: offsetY() + 1 })}
				>
					<Icon path={arrowSmallDown} class="h-6 w-6" />
				</IconButton>
				<IconButton
					class="m-3 p-1"
					onClick={changeSetting({ offsetX: offsetX() - 1 })}
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

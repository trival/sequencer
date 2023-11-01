import {
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
	For,
	createEffect,
	createMemo,
	createSignal,
	mergeProps,
	onCleanup,
	onMount,
} from 'solid-js'
import { ActiveColor, KeyboardSettings } from '@/datamodel'
import { tw } from '@/styles/tw-utils'

type Mode = 'Record' | 'Play'

export interface ActiveNote {
	note: number
	color?: ActiveColor
}

interface KeyboardProps {
	activeNotes?: ActiveNote[]
	settings: KeyboardSettings
	onNoteActivated?: (midi: number) => void
	onNoteDeactivated?: (midi: number) => void
	class?: string
	mode: Mode
}

function activeBorders(cs: ActiveColor[]): string {
	if (cs.length === 0) return ''

	const [top, right, bottom, left] =
		cs.length === 1
			? [cs[0], cs[0], cs[0], cs[0]]
			: cs.length === 2
			? [cs[0], cs[1], cs[0], cs[1]]
			: cs.length === 3
			? [cs[0], cs[1], cs[0], cs[2]]
			: [cs[0], cs[1], cs[2], cs[3]]

	const bt =
		top === 'magenta'
			? tw`border-t-fuchsia-400`
			: top === 'blue'
			? tw`border-t-blue-400`
			: top === 'cyan'
			? tw`border-t-cyan-400`
			: top === 'green'
			? tw`border-t-green-400`
			: top === 'yellow'
			? tw`border-t-yellow-400`
			: tw`border-t-red-400`

	const br =
		right === 'magenta'
			? tw`border-r-fuchsia-400`
			: right === 'blue'
			? tw`border-r-blue-400`
			: right === 'cyan'
			? tw`border-r-cyan-400`
			: right === 'green'
			? tw`border-r-green-400`
			: right === 'yellow'
			? tw`border-r-yellow-400`
			: tw`border-r-red-400`

	const bb =
		bottom === 'magenta'
			? tw`border-b-fuchsia-400`
			: bottom === 'blue'
			? tw`border-b-blue-400`
			: bottom === 'cyan'
			? tw`border-b-cyan-400`
			: bottom === 'green'
			? tw`border-b-green-400`
			: bottom === 'yellow'
			? tw`border-b-yellow-400`
			: tw`border-b-red-400`

	const bl =
		left === 'magenta'
			? tw`border-l-fuchsia-400`
			: left === 'blue'
			? tw`border-l-blue-400`
			: left === 'cyan'
			? tw`border-l-cyan-400`
			: left === 'green'
			? tw`border-l-green-400`
			: left === 'yellow'
			? tw`border-l-yellow-400`
			: tw`border-l-red-400`

	const borderBase = tw`border-4 scale-110`

	return `${borderBase} ${bt} ${br} ${bb} ${bl}`
}

const keyMargin = 3

export const Keyboard = (_props: KeyboardProps) => {
	const props = mergeProps(
		{
			activeNotes: [],
			onNoteActivated: () => {},
			onNoteDeactivated: () => {},
		} as const,
		_props,
	)

	const keySize = () => props.settings.keyLength + 2 * keyMargin

	const [pointerDown, setPointerDown] = createSignal(false)
	let wrapperRef: HTMLDivElement | undefined

	const baseFrequency = () => Tone.Frequency(props.settings.baseNote, 'midi')

	const notes = () => {
		return (props.activeNotes as ActiveNote[]).reduce(
			(acc, { note, color }) => {
				if (!acc[note]) acc[note] = new Set()
				acc[note].add(color ?? ActiveColor.Red)
				return acc
			},
			{} as Record<number, Set<ActiveColor>>,
		)
	}

	const toneBg = (tone: ToneValue) =>
		getToneBgColor(
			tone,
			midiToToneValue(props.settings.baseNote),
			props.settings.scaleHighlight,
			props.settings.toneColorType,
		)

	const isToneBgDark = (tone: ToneValue) => {
		const color = getScaleToneColor(
			tone,
			midiToToneValue(props.settings.baseNote),
			props.settings.scaleHighlight,
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

			const cols = Math.min(
				Math.floor((boxWidth - 2 * keyMargin) / keySize()),
				props.settings.maxCols,
			)
			const rows = Math.min(
				Math.floor((boxHeight - 2 * keyMargin) / keySize()),
				props.settings.maxRows,
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
			-2 + props.settings.offsetX + (-2 + props.settings.offsetY) * 5,
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
				'relative flex max-h-full max-w-full items-center justify-evenly overflow-hidden bg-white',
			)}
			style={{
				height: `${props.settings.maxRows * keySize() + 2 * keyMargin}px`,
				width: `${props.settings.maxCols * keySize() + 2 * keyMargin}px`,
			}}
		>
			<div class="flex h-full w-full flex-col justify-evenly">
				<For each={keys()}>
					{(row) => (
						<div class="flex w-full touch-none justify-evenly whitespace-nowrap">
							<For each={row}>
								{(cell) => (
									<button
										class={clsx(
											'box-border touch-none select-none rounded-md text-gray-700 shadow-sm transition-all',
											activeBorders(
												notes()[cell.midi] ? [...notes()[cell.midi]] : [],
											),
										)}
										style={{
											'background-color': toneBg(cell.toneColor),
											width: `${props.settings.keyLength}px`,
											height: `${props.settings.keyLength}px`,
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

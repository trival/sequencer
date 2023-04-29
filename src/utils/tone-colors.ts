export type ToneValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

const lightnessFactors = {
	0: 1.3,
	1: 1.1,
	2: 0.85,
	3: 0.79,
	4: 0.87,
	5: 0.8,
	6: 0.75,
	7: 0.92,
	8: 1.5,
	9: 1.4,
	10: 1.1,
	11: 1.2,
}

const saturationFactors = {
	0: 0.9,
	1: 1.1,
	2: 1.333333,
	3: 1.3,
	5: 1.2,
	6: 1.333333,
	8: 0.7,
} as Record<ToneValue, number>

const hueTurns = {
	1: -0.009,
	2: -0.025,
	3: -0.04,
	4: 0.015,
	5: 0.035,
	6: 0.015,
	7: -0.025,
	8: -0.015,
	10: -0.015,
} as Record<ToneValue, number>

export enum ToneHighlight {
	None,
	Soft,
	Strong,
}

export interface ToneColor {
	value: ToneValue
	highlight: ToneHighlight
}

export function getSimpleColorHighlight(tone: ToneValue): ToneHighlight {
	switch (tone) {
		case 0:
			return ToneHighlight.Strong
		case 5:
		case 7:
			return ToneHighlight.Soft
		default:
			return ToneHighlight.None
	}
}

export function getMinorPentatonicHighlight(tone: ToneValue): ToneHighlight {
	switch (tone) {
		case 0:
			return ToneHighlight.Strong
		case 5:
		case 7:
		case 3:
		case 10:
			return ToneHighlight.Soft
		default:
			return ToneHighlight.None
	}
}

export function getMajorHighlight(tone: ToneValue): ToneHighlight {
	switch (tone) {
		case 0:
			return ToneHighlight.Strong
		case 5:
		case 7:
		case 2:
		case 4:
		case 9:
		case 11:
			return ToneHighlight.Soft
		default:
			return ToneHighlight.None
	}
}

export enum ScaleHighlight {
	None,
	Tonic,
	Simple,
	MinorPentatonic,
	Major,
}

export enum ToneColorType {
	Chromatic,
	CircleOfFiths,
}

export function getScaleToneColor(
	tone: ToneValue,
	baseTone: ToneValue,
	scale: ScaleHighlight,
): ToneColor {
	const highlightTone = mod(tone - baseTone, 12) as ToneValue
	switch (scale) {
		case ScaleHighlight.Simple:
			return {
				value: tone,
				highlight: getSimpleColorHighlight(highlightTone),
			}
		case ScaleHighlight.MinorPentatonic:
			return {
				value: tone,
				highlight: getMinorPentatonicHighlight(highlightTone),
			}
		case ScaleHighlight.Major:
			return {
				value: tone,
				highlight: getMajorHighlight(highlightTone),
			}
		case ScaleHighlight.Tonic:
			return {
				value: tone,
				highlight:
					highlightTone === 0 ? ToneHighlight.Strong : ToneHighlight.None,
			}
		case ScaleHighlight.None:
			return {
				value: tone,
				highlight: ToneHighlight.Soft,
			}
	}
}

export function mod(n: number, m: number) {
	return ((n % m) + m) % m
}

export const midiToToneValue = (midi: number) => mod(midi, 12) as ToneValue

export function toHSL(color: ToneValue, highlight: ToneHighlight): string {
	const lightnessFactor =
		(lightnessFactors[color] - 1) * (highlight / 2) * (highlight / 2) + 1
	const saturationFactor =
		(saturationFactors[color] - 1) * (highlight / 2) * (highlight / 2) + 1 || 1
	const hueTurn = hueTurns[color] || 0

	const saturation = Math.floor(
		(100 * (highlight + 2) * saturationFactor) / 4.5,
	)
	const lightness = Math.floor((3.1 - highlight) * 29.5 * lightnessFactor)
	const hue = color / 12 + hueTurn

	return `hsl(${hue}turn ${saturation}% ${lightness}%)`
}

export function chromaticBgColor(tone: ToneColor): string {
	const color = ((tone.value + 6) % 12) as ToneValue
	return toHSL(color, tone.highlight)
}

export function circleOfFithsBgColor(tone: ToneColor): string {
	const color = tone.value % 2 === 0 ? (tone.value + 6) % 12 : tone.value
	return toHSL(color as ToneValue, tone.highlight)
}

export function getToneBgColor(
	tone: ToneValue,
	baseTone: ToneValue,
	scale: ScaleHighlight,
	colorVariant: ToneColorType,
): string {
	const toneColor = getScaleToneColor(tone, baseTone, scale)
	switch (colorVariant) {
		case ToneColorType.Chromatic:
			return chromaticBgColor(toneColor)
		case ToneColorType.CircleOfFiths:
			return circleOfFithsBgColor(toneColor)
	}
}

export type ToneValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11

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

export function toHSL(hue: number, highlight: ToneHighlight): string {
	const saturation = Math.floor((100 * (highlight + 1)) / 3)
	const lightness = Math.floor((4 - highlight) * 22)
	return `hsl(${hue}turn ${saturation}% ${lightness}%)`
}

export function chromaticBgColor(tone: ToneColor): string {
	const hue = ((tone.value + 6) % 12) / 12
	return toHSL(hue, tone.highlight)
}

export function circleOfFithsBgColor(tone: ToneColor): string {
	const value = tone.value % 2 === 0 ? (tone.value + 6) % 12 : tone.value
	const hue = value / 12
	return toHSL(hue, tone.highlight)
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

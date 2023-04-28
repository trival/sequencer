import { ToneHighlight, ToneValue, chromaticBgColor } from '@/utils/tone-colors'

interface Props {
	color: string
	value: ToneValue
}

const TestColor = ({ color, value }: Props) => {
	return (
		<div
			className="w-20 h-20 m-1 py-3 px-4 rounded-md box-border select-none touch-none text-gray-800"
			v-for="c in chromNoneColors"
			key={value}
			style={{ backgroundColor: color }}
		>
			{value}
		</div>
	)
}

const ColorTestPage = () => {
	const chromaticValues: ToneValue[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
	const circleOfFithsValues: ToneValue[] = [
		0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5,
	]

	const chromNoneColors = chromaticValues.map((value) => ({
		color: chromaticBgColor({
			value,
			highlight: ToneHighlight.None,
		}),
		value,
	}))

	return (
		<div>
			<h2>Chromatic Scale</h2>
			<h3>No Highlight</h3>
			<div className="flex">
				{chromNoneColors.map((c) => (
					<TestColor {...c} key={c.value} />
				))}
			</div>
			<div className="flex">
				{chromNoneColors
					.map((c) => ({
						color: c.color,
						value: ((c.value + 6) % 12) as ToneValue,
					}))
					.map((c) => (
						<TestColor {...c} key={c.value} />
					))}
			</div>
			<h3>Soft Highlight</h3>
			<h3>Strong Highlight</h3>
		</div>
	)
}

export default ColorTestPage

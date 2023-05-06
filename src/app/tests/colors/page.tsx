import { ToneHighlight, ToneValue, chromaticBgColor } from '@/utils/tone-colors'

interface TestColorProps {
	color: string
	value: ToneValue
}

const TestColor = ({ color, value }: TestColorProps) => {
	return (
		<div
			className="w-20 h-20 m-1 py-3 px-4 rounded-md box-border select-none touch-none text-gray-800"
			v-for="c in chromNoneColors"
			key={value}
			style={{ backgroundColor: color }}
			title={color}
		>
			{value}
		</div>
	)
}

const TestColors = ({
	values,
	highlight,
}: {
	values: ToneValue[]
	highlight: ToneHighlight
}) => {
	return (
		<>
			<div className="flex">
				{values.map((value) => (
					<TestColor
						key={value}
						color={chromaticBgColor({ value, highlight })}
						value={value}
					/>
				))}
			</div>
			<div className="flex">
				{values
					.map((val) => ((val + 6) % 12) as ToneValue)
					.map((value) => (
						<TestColor
							key={value}
							color={chromaticBgColor({ value, highlight })}
							value={value}
						/>
					))}
			</div>
		</>
	)
}

const ColorTestPage = () => {
	const chromaticValues: ToneValue[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
	const circleOfFifthsValues: ToneValue[] = [
		0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5,
	]

	return (
		<div className="flex justify-center items-center">
			<div>
				<h2 className="my-6 font-bold">Chromatic Scale</h2>
				<h3>No Highlight</h3>
				<TestColors values={chromaticValues} highlight={ToneHighlight.None} />
				<h3>Soft Highlight</h3>
				<TestColors values={chromaticValues} highlight={ToneHighlight.Soft} />
				<h3>Strong Highlight</h3>
				<TestColors values={chromaticValues} highlight={ToneHighlight.Strong} />

				<h2 className="my-6 font-bold">Circle of Fifths</h2>
				<h3>No Highlight</h3>
				<TestColors
					values={circleOfFifthsValues}
					highlight={ToneHighlight.None}
				/>
				<h3>Soft Highlight</h3>
				<TestColors
					values={circleOfFifthsValues}
					highlight={ToneHighlight.Soft}
				/>
				<h3>Strong Highlight</h3>
				<TestColors
					values={circleOfFifthsValues}
					highlight={ToneHighlight.Strong}
				/>
			</div>
		</div>
	)
}

export default ColorTestPage

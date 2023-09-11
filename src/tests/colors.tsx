import { For } from 'solid-js'
import { ToneHighlight, ToneValue, chromaticBgColor } from '@/utils/tone-colors'

interface TestColorProps {
	color: string
	value: ToneValue
}

const TestColor = (props: TestColorProps) => {
	return (
		<div
			class="m-1 box-border h-20 w-20 touch-none select-none rounded-md px-4 py-3 text-gray-800"
			style={{ 'background-color': props.color }}
			title={props.color}
		>
			{props.value}
		</div>
	)
}

const TestColors = (props: {
	values: ToneValue[]
	highlight: ToneHighlight
}) => (
	<>
		<div class="flex">
			<For each={props.values}>
				{(value) => (
					<TestColor
						color={chromaticBgColor({ value, highlight: props.highlight })}
						value={value}
					/>
				)}
			</For>
		</div>
		<div class="flex">
			<For each={props.values.map((val) => ((val + 6) % 12) as ToneValue)}>
				{(value) => (
					<TestColor
						color={chromaticBgColor({ value, highlight: props.highlight })}
						value={value}
					/>
				)}
			</For>
		</div>
	</>
)

const ColorTestPage = () => {
	const chromaticValues: ToneValue[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
	const circleOfFifthsValues: ToneValue[] = [
		0, 7, 2, 9, 4, 11, 6, 1, 8, 3, 10, 5,
	]

	return (
		<div class="flex items-center justify-center">
			<div>
				<h2 class="my-6 font-bold">Chromatic Scale</h2>
				<h3>No Highlight</h3>
				<TestColors values={chromaticValues} highlight={ToneHighlight.None} />
				<h3>Soft Highlight</h3>
				<TestColors values={chromaticValues} highlight={ToneHighlight.Soft} />
				<h3>Strong Highlight</h3>
				<TestColors values={chromaticValues} highlight={ToneHighlight.Strong} />

				<h2 class="my-6 font-bold">Circle of Fifths</h2>
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

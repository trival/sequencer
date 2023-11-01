interface Props {
	class?: string
}

export default function Logo(props: Props) {
	return (
		<svg
			class={props.class}
			viewBox="0 0 380 380"
			xmlns="http://www.w3.org/2000/svg"
		>
			<defs>
				<linearGradient
					gradientUnits="userSpaceOnUse"
					x1="313.449"
					y1="113.677"
					x2="313.449"
					y2="396.093"
					id="gradient-1"
					gradientTransform="matrix(0.853625, 0.497947, -0.572326, 0.981132, 107.882267, -151.405179)"
				>
					<stop offset="0" style={{ 'stop-color': 'rgb(112, 171, 168)' }} />
					<stop offset="1" style={{ 'stop-color': 'rgb(168, 110, 147)' }} />
				</linearGradient>
			</defs>
			<path
				d="M 309.763 113.677 L 474.763 396.093 L 144.763 396.093 L 309.763 113.677 Z"
				style={{
					'transform-box': 'fill-box',
					'transform-origin': '50% 50%',
					fill: 'url(#gradient-1)',
				}}
				transform="matrix(0, 1, -1, 0, -117.673203, -67.366379)"
			/>
		</svg>
	)
}

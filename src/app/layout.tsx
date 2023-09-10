import '@/styles/globals.css'
import { PropsWithChildren } from 'react'

export default function Document({ children }: PropsWithChildren) {
	return (
		<html lang="en">
			<meta charSet="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />

			<body>{children}</body>
		</html>
	)
}

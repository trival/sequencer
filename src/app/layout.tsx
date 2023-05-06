import '@/styles/globals.css'
import { PropsWithChildren } from 'react'

export default function Document({ children }: PropsWithChildren) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	)
}

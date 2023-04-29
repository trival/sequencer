import '@/styles/globals.css'
import { enableMapSet } from 'immer'
import type { AppProps } from 'next/app'

enableMapSet()

export default function App({ Component, pageProps }: AppProps) {
	return <Component {...pageProps} />
}

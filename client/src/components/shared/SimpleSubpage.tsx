import { JSX, ParentProps } from 'solid-js'
import Logo from '../icons/logo'
import { A } from '@solidjs/router'

interface SubpageProps extends ParentProps {
	navOpts?: JSX.Element
}

export function Subpage(props: SubpageProps) {
	return (
		<div class="relative flex h-full w-full flex-col">
			<nav class="z-10 flex items-center px-2 py-1 lg:px-4 lg:py-4">
				<A href="/" class="font-semibold underline">
					<Logo class="h-6 w-6" />
				</A>
				<span class="flex-grow" />
				{props.navOpts}
			</nav>
			{props.children}
		</div>
	)
}

import Logo from '@/components/icons/logo'
import { A } from '@solidjs/router'

export default function HomePage() {
	return (
		<div class="flex h-full w-full items-center justify-center overflow-y-auto">
			<main class="text-center">
				<header class="flex items-center">
					<Logo class="mr-3 inline-block h-8 w-8 sm:h-10 sm:w-10" />
					<h1 class="text-3xl font-thin uppercase sm:text-4xl">
						trival sequencer
					</h1>
				</header>
				<nav class="mt-8 text-xl text-cyan-700">
					<ul>
						<li class="my-3">
							<A href="/keyboard">Keyboard</A>
						</li>
						<li>
							<A href="/songs">My Songs</A>
						</li>
					</ul>
				</nav>
			</main>
		</div>
	)
}

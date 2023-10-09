import Popover, { Overlay } from '@/components/Popover'
import { createSignal } from 'solid-js'

export default function PopoverTest() {
	const [isVisibilePopover, setVisiblePopover] = createSignal(false)
	const [isVisibileOverlay, setVisibleOverlay] = createSignal(false)

	let button: HTMLButtonElement | undefined

	return (
		<div class="h-[200vh] p-20">
			<div class="py-20">
				<button onClick={() => setVisiblePopover(true)} ref={button}>
					Click me Popover!
				</button>
				<Popover
					referenceElement={button as HTMLButtonElement}
					onClose={() => setVisiblePopover(false)}
					visible={isVisibilePopover()}
					class="bg-teal-200 w-fit shadow-md rounded-md p-4"
					popperOptions={{ placement: 'top' }}
				>
					hello Popover!
				</Popover>
			</div>
			<div class="py-20">
				<button onClick={() => setVisibleOverlay(true)}>
					Click me Overlay!
				</button>
				<Overlay
					onClose={() => setVisibleOverlay(false)}
					visible={isVisibileOverlay()}
					class="bg-teal-200 w-fit shadow-md rounded-md p-4"
				>
					hello Overlay!
				</Overlay>
			</div>
		</div>
	)
}

import Popover, { Overlay } from '@/components/shared/popover'
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
					class="w-fit rounded-md bg-teal-200 p-4 shadow-md"
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
					class="w-fit rounded-md bg-teal-200 p-4 shadow-md"
				>
					hello Overlay!
				</Overlay>
			</div>
		</div>
	)
}

import Popover from '@/components/Popover'
import { createSignal } from 'solid-js'

export default function PopoverTest() {
	const [isVisibile, setVisible] = createSignal(false)
	let button: HTMLButtonElement
	return (
		<div class="h-[200vh] py-40 px-20">
			<button onClick={() => setVisible(true)} ref={button}>
				Click me
			</button>
			<Popover
				referenceElement={button}
				onClose={() => setVisible(false)}
				visible={isVisibile()}
				class="bg-teal-200 w-fit shadow-md rounded-md p-4"
				popperOptions={{ placement: 'top' }}
			>
				hello Popover!
			</Popover>
		</div>
	)
}

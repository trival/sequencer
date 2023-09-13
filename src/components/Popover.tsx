import { Motion, Presence } from '@motionone/solid'
import {
	Instance,
	Modifier,
	OptionsGeneric,
	createPopper,
} from '@popperjs/core'
import { ParentProps, Show, createEffect } from 'solid-js'

interface PopoverProps {
	referenceElement: HTMLElement
	visible: boolean
	onClose: () => void
	class?: string
	popperOptions?: Partial<OptionsGeneric<Partial<Modifier<any, any>>>>
}

export default function Popover(props: ParentProps<PopoverProps>) {
	let ref: HTMLDivElement
	let popper: Instance

	function close() {
		props.onClose()
	}

	createEffect(() => {
		if (props.visible) {
			requestAnimationFrame(() => {
				popper = createPopper(props.referenceElement, ref, props.popperOptions)
				popper.setOptions((options) => {
					options.modifiers = [
						...options.modifiers,
						{ name: 'eventListeners', enabled: true },
					]
					return options
				})
				requestAnimationFrame(() => {
					popper?.update()
				})
				window.addEventListener('click', close)
			})
		} else {
			window.removeEventListener('click', close)
		}
	})

	return (
		<Presence exitBeforeEnter>
			<Show when={props.visible}>
				<Motion.div
					class={props.class}
					ref={ref}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					onMotionComplete={() => {
						if (!props.visible) popper?.destroy()
					}}
					onClick={(e) => {
						e.stopPropagation()
					}}
				>
					{props.children}
				</Motion.div>
			</Show>
		</Presence>
	)
}
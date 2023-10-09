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
	let ref: HTMLDivElement | undefined
	let popper: Instance

	function close() {
		props.onClose()
	}

	createEffect(() => {
		if (props.visible) {
			requestAnimationFrame(() => {
				popper = createPopper(props.referenceElement, ref!, props.popperOptions)
				popper.setOptions((options) => {
					options.modifiers = [
						...(options.modifiers as any[]),
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

interface OverlayProps {
	visible: boolean
	onClose: () => void
	class?: string
}

export function Overlay(props: ParentProps<OverlayProps>) {
	return (
		<Presence exitBeforeEnter>
			<Show when={props.visible}>
				<Motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					class="fixed inset-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto bg-black bg-opacity-50"
					onClick={(e) => {
						e.stopPropagation()
						props.onClose()
					}}
				>
					<Motion.div
						class={props.class}
						initial={{ transform: 'translateY(-10px)' }}
						animate={{ transform: 'translateY(0px)' }}
						exit={{ transform: 'translateY(-10px)' }}
						transition={{ duration: 0.3 }}
						onClick={(e) => {
							e.stopPropagation()
						}}
					>
						{props.children}
					</Motion.div>
				</Motion.div>
			</Show>
		</Presence>
	)
}

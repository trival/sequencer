import { tw } from '@/styles/tw-utils'
import { Icon } from 'solid-heroicons'
import { plus, play, pause } from 'solid-heroicons/solid'
import { trash, pencilSquare } from 'solid-heroicons/outline'
import clsx from 'clsx'
import { JSX, ParentProps, mergeProps, onMount } from 'solid-js'
import { createPopper } from '@popperjs/core'

interface ButtonProps {
	onClick?: () => void
	class?: string
	color?: keyof typeof btnColors
	type?: 'button' | 'submit' | 'reset'
}

const btnColors = {
	indigo: tw`bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600 text-white`,
	rose: tw`bg-rose-600 hover:bg-rose-500 focus-visible:outline-rose-600 text-white`,
	teal: tw`bg-teal-600 hover:bg-teal-500 focus-visible:outline-teal-600 text-white`,
	white: tw`bg-white border border-slate-400 text-slate-500 shadow-slate-400 hover:border-indigo-500 hover:text-indigo-500 focus-visible:outline-indigo-500`,
}

const btnFocus = tw`focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`

export const IconButton = (_props: ParentProps<ButtonProps>) => {
	const props = mergeProps({ color: 'white', type: 'button' }, _props)
	return (
		<button
			type={props.type}
			class={clsx(
				'rounded-full shadow-sm shadow-slate-400',
				btnColors[props.color],
				btnFocus,
				props.class,
			)}
			onClick={() => props.onClick()}
		>
			{props.children}
		</button>
	)
}

export const Button = (_props: ParentProps<ButtonProps>) => {
	const props = mergeProps({ color: 'white', type: 'button' }, _props)
	return (
		<button
			type={props.type}
			class={clsx(
				'rounded-md px-3.5 py-2.5 text-sm font-semibold shadow-sm',
				btnColors[props.color],
				btnFocus,
				props.class,
			)}
			onClick={() => props.onClick}
		>
			{props.children}
		</button>
	)
}

export const IconButtonPopover = (
	_props: ParentProps<
		ButtonProps & {
			buttonElement: JSX.Element
		}
	>,
) => {
	const props = mergeProps({ color: 'white' }, _props)

	let referenceElement: HTMLButtonElement
	let popperElement: HTMLDivElement

	onMount(() => {
		createPopper(referenceElement, popperElement)
	})

	return (
		<Popover class="relative">
			<Popover.Button
				ref={referenceElement}
				type="button"
				class={clsx(
					'm-2 rounded-full p-2 shadow-sm shadow-slate-400',
					btnColors[props.color],
					btnFocus,
					props.class,
				)}
			>
				{props.buttonElement}
			</Popover.Button>
			<Popover.Panel
				ref={popperElement}
				class="absolute z-10 my-2 rounded bg-gray-100/90 p-4 shadow-md"
				style={styles.popper}
				{...attributes.popper}
			>
				{props.children}
			</Popover.Panel>
		</Popover>
	)
}

interface DeleteButtonProps {
	onConfirm: () => void
}

export const DeleteButton = (props: DeleteButtonProps) => {
	return (
		<IconButtonPopover
			color="rose"
			buttonElement={<Icon path={trash} class="h-6 w-6" aria-hidden="true" />}
		>
			{({ close }) => (
				<Button
					color="rose"
					onClick={() => {
						close()
						props.onConfirm()
					}}
				>
					Confirm
				</Button>
			)}
		</IconButtonPopover>
	)
}

export const AddButton = (props: ParentProps) => {
	return (
		<IconButtonPopover
			color="indigo"
			buttonElement={<Icon path={plus} class="h-6 w-6" aria-hidden="true" />}
		>
			{props.children}
		</IconButtonPopover>
	)
}

export const EditButton = (props: ParentProps) => {
	return (
		<IconButtonPopover
			color="teal"
			buttonElement={
				<Icon path={pencilSquare} class="h-6 w-6" aria-hidden="true" />
			}
		>
			{props.children}
		</IconButtonPopover>
	)
}

interface PlayButtonProps {
	isPlaying?: boolean
	onClick: () => void
	class?: string
}
export const PlayButton = (props: PlayButtonProps) => {
	return (
		<button
			type="button"
			onClick={() => props.onClick()}
			class={clsx(
				'm-2 rounded p-2 shadow-sm',
				btnColors.white,
				btnFocus,
				props.class,
			)}
		>
			{props.isPlaying ? (
				<Icon path={pause} class="h-6 w-6" />
			) : (
				<Icon path={play} class="h-6 w-6" />
			)}
		</button>
	)
}

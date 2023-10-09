import { tw } from '@/styles/tw-utils'
import { Icon } from 'solid-heroicons'
import { plus, play, pause } from 'solid-heroicons/solid'
import { trash, pencilSquare } from 'solid-heroicons/outline'
import clsx from 'clsx'
import { JSX, ParentProps, createSignal, mergeProps } from 'solid-js'
import Popover from './Popover'

interface ButtonProps {
	onClick?: () => void
	class?: string
	color?: keyof typeof btnColors
	type?: 'button' | 'submit' | 'reset'
	ref?: HTMLButtonElement
	title?: string
}

const btnColors = {
	indigo: tw`bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600 text-white`,
	rose: tw`bg-rose-600 hover:bg-rose-500 focus-visible:outline-rose-600 text-white`,
	teal: tw`bg-teal-600 hover:bg-teal-500 focus-visible:outline-teal-600 text-white`,
	white: tw`bg-white border border-slate-400 text-slate-500 hover:border-indigo-500 hover:text-indigo-500 focus-visible:outline-indigo-500`,
}

const btnFocus = tw`focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`

export const IconButton = (_props: ParentProps<ButtonProps>) => {
	const props = mergeProps({ color: 'white', type: 'button' } as const, _props)
	return (
		<button
			type={props.type}
			class={clsx(
				'rounded-full shadow-sm shadow-slate-300',
				btnColors[props.color],
				btnFocus,
				props.class,
			)}
			onClick={() => props.onClick?.()}
			ref={props.ref}
			title={props.title}
		>
			{props.children}
		</button>
	)
}

export const Button = (_props: ParentProps<ButtonProps>) => {
	const props = mergeProps({ color: 'white', type: 'button' } as const, _props)
	return (
		<button
			type={props.type}
			class={clsx(
				'rounded-md px-3.5 py-2.5 text-sm font-semibold shadow-sm shadow-slate-300',
				btnColors[props.color],
				btnFocus,
				props.class,
			)}
			onClick={() => props.onClick?.()}
			ref={props.ref}
			title={props.title}
		>
			{props.children}
		</button>
	)
}

export const IconButtonPopover = (
	_props: ButtonProps & {
		buttonElement: JSX.Element
		children: (close: () => void) => JSX.Element
	},
) => {
	const props = mergeProps({ color: 'white' } as const, _props)

	const [isOpen, setOpen] = createSignal(false)

	const close = () => setOpen(false)
	const open = () => setOpen(true)

	let btnRef: HTMLButtonElement | undefined

	return (
		<div class="relative inline-block">
			<IconButton
				ref={btnRef}
				type="button"
				color={props.color}
				class={clsx('m-2 p-2', props.class)}
				onClick={open}
				title={props.title}
			>
				{props.buttonElement}
			</IconButton>
			<Popover
				referenceElement={btnRef as HTMLButtonElement}
				onClose={close}
				visible={isOpen()}
				class="absolute z-10 my-2 rounded bg-gray-100/90 p-4 shadow-md"
				popperOptions={{
					placement: 'bottom-start',
					modifiers: [{ name: 'offset', options: { offset: [0, 10] } }],
				}}
			>
				{props.children(close)}
			</Popover>
		</div>
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
			title="Delete"
		>
			{(close) => (
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

export const AddButton = (props: {
	children: (close: () => void) => JSX.Element
}) => {
	return (
		<IconButtonPopover
			color="indigo"
			buttonElement={<Icon path={plus} class="h-6 w-6" aria-hidden="true" />}
			title="Add"
		>
			{props.children}
		</IconButtonPopover>
	)
}

export const EditButton = (props: {
	children: (close: () => void) => JSX.Element
}) => {
	return (
		<IconButtonPopover
			color="teal"
			buttonElement={
				<Icon path={pencilSquare} class="h-6 w-6" aria-hidden="true" />
			}
			title="Edit"
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
				'm-2 rounded-md p-2 shadow-sm shadow-slate-300',
				btnColors.white,
				btnFocus,
				props.class,
			)}
			title={props.isPlaying ? 'Pause' : 'Play'}
		>
			{props.isPlaying ? (
				<Icon path={pause} class="h-6 w-6" />
			) : (
				<Icon path={play} class="h-6 w-6" />
			)}
		</button>
	)
}

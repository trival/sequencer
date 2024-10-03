import { tw } from '@/styles/tw-utils'
import clsx from 'clsx'
import { Icon } from 'solid-heroicons'
import { pencilSquare, power, trash } from 'solid-heroicons/outline'
import { pause, play, plus } from 'solid-heroicons/solid'
import { JSX, ParentProps, createSignal, mergeProps } from 'solid-js'
import Popover from './popover'

interface ButtonProps {
	onClick?: (e: Event) => void
	class?: string
	color?: keyof typeof btnColors
	type?: 'button' | 'submit' | 'reset'
	ref?: HTMLButtonElement
	title?: string
	disabled?: boolean
}

const btnColors = {
	indigo: tw`bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600 text-white`,
	rose: tw`bg-rose-600 hover:bg-rose-500 focus-visible:outline-rose-600 text-white`,
	teal: tw`bg-teal-600 hover:bg-teal-500 focus-visible:outline-teal-600 text-white`,
	white: tw`bg-white border border-slate-400 text-slate-500 hover:border-indigo-500 hover:text-indigo-500 focus-visible:outline-indigo-500`,
	custom: tw`focus-visible:outline-indigo-500`,
}

const btnFocus = tw`focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`
const disabled = tw`opacity-50 cursor-not-allowed`

export const IconButton = (_props: ParentProps<ButtonProps>) => {
	const props = mergeProps({ color: 'white', type: 'button' } as const, _props)
	return (
		<button
			type={props.type}
			class={clsx(
				props.color !== 'custom' && 'rounded-full shadow-sm shadow-slate-300',
				btnColors[props.color],
				btnFocus,
				props.class,
				props.disabled && disabled,
			)}
			onClick={(e) => props.onClick?.(e)}
			ref={props.ref}
			title={props.title}
			disabled={props.disabled}
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
				props.disabled && disabled,
			)}
			onClick={(e) => props.onClick?.(e)}
			ref={props.ref}
			title={props.title}
			disabled={props.disabled}
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

	let btnRef: HTMLButtonElement | undefined

	return (
		<div class="relative inline-block">
			<IconButton
				ref={btnRef}
				type="button"
				color={props.color}
				class={clsx('m-2 p-2', props.class)}
				onClick={(e) => {
					setOpen(!isOpen())
					props.onClick?.(e)
				}}
				title={props.title}
				disabled={props.disabled}
			>
				{props.buttonElement}
			</IconButton>
			<Popover
				referenceElement={btnRef as HTMLButtonElement}
				onClose={() => setOpen(false)}
				visible={isOpen()}
				class="absolute z-10 my-2 rounded bg-gray-100/90 p-2 shadow-md"
				popperOptions={{
					placement: 'bottom-start',
					modifiers: [{ name: 'offset', options: { offset: [0, 10] } }],
				}}
			>
				{props.children(() => setOpen(false))}
			</Popover>
		</div>
	)
}

export const DeleteButton = (props: ButtonProps) => {
	return (
		<IconButton
			color="rose"
			title="Delete"
			type="button"
			onClick={props.onClick}
			class={clsx('m-2 p-2', props.class)}
			ref={props.ref}
		>
			<Icon path={trash} class="h-6 w-6" aria-hidden="true" />
		</IconButton>
	)
}

export const AddButton = (props: ButtonProps) => {
	return (
		<IconButton
			color="indigo"
			title="Add"
			type="button"
			onClick={props.onClick}
			class={clsx('m-2 p-2', props.class)}
			ref={props.ref}
		>
			<Icon path={plus} class="h-6 w-6" aria-hidden="true" />
		</IconButton>
	)
}

export const EditButton = (props: ButtonProps) => {
	return (
		<IconButton
			color="teal"
			title="Edit"
			type="button"
			onClick={props.onClick}
			class={clsx('m-2 p-2', props.class)}
			ref={props.ref}
		>
			<Icon path={pencilSquare} class="h-6 w-6" aria-hidden="true" />
		</IconButton>
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

interface LogoutButtonProps {
	onLogout: () => void
	class?: string
}

export const LogoutButton = (props: LogoutButtonProps) => {
	return (
		<IconButtonPopover
			color="custom"
			class={clsx('m-0', props.class)}
			buttonElement={<Icon path={power} class="h-5 w-5" aria-hidden="true" />}
			title="Logout"
		>
			{(close) => (
				<Button
					color="rose"
					onClick={() => {
						close()
						props.onLogout()
					}}
				>
					Logout
				</Button>
			)}
		</IconButtonPopover>
	)
}

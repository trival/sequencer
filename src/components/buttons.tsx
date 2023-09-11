import { tw } from '@/styles/tw-utils'
import { Popover, PopoverPanelProps } from '@headlessui/react'
import {
	PlusIcon,
	PlayIcon,
	PauseIcon,
	StopIcon,
} from '@heroicons/react/20/solid'
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { ElementType, PropsWithChildren, ReactNode, useState } from 'react'
import { usePopper } from 'react-popper'

interface ButtonProps extends PropsWithChildren {
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

export const IconButton = ({
	children,
	onClick,
	class,
	color = 'white',
	type = 'button',
}: ButtonProps) => (
	<button
		type={type}
		class={clsx(
			'rounded-full shadow-sm shadow-slate-400',
			btnColors[color],
			btnFocus,
			class,
		)}
		onClick={onClick}
	>
		{children}
	</button>
)

export const Button = ({
	children,
	onClick,
	class,
	color = 'white',
	type = 'button',
}: ButtonProps) => (
	<button
		type={type}
		class={clsx(
			'rounded-md px-3.5 py-2.5 text-sm font-semibold shadow-sm',
			btnColors[color],
			btnFocus,
			class,
		)}
		onClick={onClick}
	>
		{children}
	</button>
)

interface PopoverChildren {
	children: PopoverPanelProps<ElementType>['children']
}

export const IconButtonPopover = ({
	children,
	buttonChildren,
	class,
	color = 'white',
}: Omit<ButtonProps, 'children'> & {
	buttonChildren: ReactNode
} & PopoverChildren) => {
	const [referenceElement, setReferenceElement] =
		useState<HTMLButtonElement | null>(null)
	const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
		null,
	)
	const { styles, attributes } = usePopper(referenceElement, popperElement)
	return (
		<Popover class="relative">
			<Popover.Button
				ref={setReferenceElement}
				type="button"
				class={clsx(
					'm-2 rounded-full p-2 shadow-sm shadow-slate-400',
					btnColors[color],
					btnFocus,
					class,
				)}
			>
				{buttonChildren}
			</Popover.Button>
			<Popover.Panel
				ref={setPopperElement}
				class="absolute z-10 my-2 rounded bg-gray-100/90 p-4 shadow-md"
				style={styles.popper}
				{...attributes.popper}
			>
				{children}
			</Popover.Panel>
		</Popover>
	)
}

interface DeleteButtonProps {
	onConfirm: () => void
}

export const DeleteButton = ({ onConfirm }: DeleteButtonProps) => {
	return (
		<IconButtonPopover
			color="rose"
			buttonChildren={<TrashIcon class="h-6 w-6" aria-hidden="true" />}
		>
			{({ close }) => (
				<Button
					color="rose"
					onClick={() => {
						close()
						onConfirm()
					}}
				>
					Confirm
				</Button>
			)}
		</IconButtonPopover>
	)
}

export const AddButton = ({ children }: PopoverChildren) => {
	return (
		<IconButtonPopover
			color="indigo"
			buttonChildren={<PlusIcon class="h-6 w-6" aria-hidden="true" />}
		>
			{children}
		</IconButtonPopover>
	)
}

export const EditButton = ({ children }: PopoverChildren) => {
	return (
		<IconButtonPopover
			color="teal"
			buttonChildren={
				<PencilSquareIcon class="h-6 w-6" aria-hidden="true" />
			}
		>
			{children}
		</IconButtonPopover>
	)
}

interface PlayButtonProps {
	isPlaying?: boolean
	onClick: () => void
	class?: string
}
export const PlayButton = ({
	isPlaying,
	onClick,
	class,
}: PlayButtonProps) => {
	return (
		<button
			type="button"
			onClick={onClick}
			class={clsx(
				'm-2 rounded p-2 shadow-sm',
				btnColors.white,
				btnFocus,
				class,
			)}
		>
			{isPlaying ? (
				<PauseIcon class="h-6 w-6" />
			) : (
				<PlayIcon class="h-6 w-6" />
			)}
		</button>
	)
}

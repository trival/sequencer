import { tw } from '@/styles/tw-utils'
import { Popover, PopoverPanelProps } from '@headlessui/react'
import { PlusIcon } from '@heroicons/react/20/solid'
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { ElementType, PropsWithChildren, ReactNode, useState } from 'react'
import { usePopper } from 'react-popper'

interface ButtonProps extends PropsWithChildren {
	onClick?: () => void
	className?: string
	color?: keyof typeof btnColors
	type?: 'button' | 'submit' | 'reset'
}

const btnColors = {
	indigo: tw`bg-indigo-600 hover:bg-indigo-500 focus-visible:outline-indigo-600 text-white`,
	rose: tw`bg-rose-600 hover:bg-rose-500 focus-visible:outline-rose-600 text-white`,
	teal: tw`bg-teal-600 hover:bg-teal-500 focus-visible:outline-teal-600 text-white`,
	transparent: tw`border border-slate-300 text-slate-500 shadow-slate-300 hover:border-indigo-400 focus-visible:outline-indigo-400`,
}

const btnFocus = tw`focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`

export const IconButton = ({
	children,
	onClick,
	className,
	color = 'transparent',
	type = 'button',
}: ButtonProps) => (
	<button
		type={type}
		className={clsx(
			'rounded-full shadow-sm',
			btnColors[color],
			btnFocus,
			className,
		)}
		onClick={onClick}
	>
		{children}
	</button>
)

export const Button = ({
	children,
	onClick,
	className,
	color = 'transparent',
	type = 'button',
}: ButtonProps) => (
	<button
		type={type}
		className={clsx(
			'rounded-md px-3.5 py-2.5 text-sm font-semibold shadow-sm',
			btnColors[color],
			btnFocus,
			className,
		)}
		onClick={onClick}
	>
		{children}
	</button>
)

export const IconButtonPopover = ({
	children,
	buttonChildren,
	className,
	color = 'transparent',
}: Omit<ButtonProps, 'children'> & {
	buttonChildren: ReactNode
	children: PopoverPanelProps<ElementType>['children']
}) => {
	const [referenceElement, setReferenceElement] =
		useState<HTMLButtonElement | null>(null)
	const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(
		null,
	)
	const { styles, attributes } = usePopper(referenceElement, popperElement)
	return (
		<Popover className="relative">
			<Popover.Button
				ref={setReferenceElement}
				type="button"
				className={clsx(
					'm-2 rounded-full p-2 shadow-sm',
					btnColors[color],
					btnFocus,
					className,
				)}
			>
				{buttonChildren}
			</Popover.Button>
			<Popover.Panel
				ref={setPopperElement}
				className="absolute z-10 my-2 rounded bg-gray-100/90 p-4 shadow-md"
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
			buttonChildren={<TrashIcon className="h-6 w-6" aria-hidden="true" />}
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

export const AddButton = ({ children }: PropsWithChildren) => {
	return (
		<IconButtonPopover
			color="indigo"
			buttonChildren={<PlusIcon className="h-6 w-6" aria-hidden="true" />}
		>
			{children}
		</IconButtonPopover>
	)
}

export const EditButton = ({ children }: PropsWithChildren) => {
	return (
		<IconButtonPopover
			color="teal"
			buttonChildren={
				<PencilSquareIcon className="h-6 w-6" aria-hidden="true" />
			}
		>
			{children}
		</IconButtonPopover>
	)
}

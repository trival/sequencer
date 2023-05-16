import { Popover } from '@headlessui/react'
import { PlusIcon } from '@heroicons/react/20/solid'
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { PropsWithChildren } from 'react'

interface ButtonProps extends PropsWithChildren {
	onClick?: () => void
	className?: string
}

export const IconButton = ({ children, onClick, className }: ButtonProps) => (
	<button
		type="button"
		className={clsx(
			'rounded-full border border-slate-300 p-0 text-slate-400 shadow-sm shadow-slate-300 hover:border-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400',
			className,
		)}
		onClick={onClick}
	>
		{children}
	</button>
)

export const Button = ({ children, onClick, className }: ButtonProps) => (
	<button
		type="button"
		className={clsx(
			'mr-3 w-full rounded-md bg-teal-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600',
			className,
		)}
		onClick={onClick}
	>
		{children}
	</button>
)

interface DeleteButtonProps {
	onConfirm: () => void
}

export const DeleteButton = ({ onConfirm }: DeleteButtonProps) => {
	return (
		<Popover className="relative">
			<Popover.Button className="m-2 rounded-full bg-rose-600 p-2 text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600">
				<TrashIcon className="h-6 w-6" aria-hidden="true" />
			</Popover.Button>

			<Popover.Panel className="absolute z-10 mt-2 rounded bg-gray-100/70 p-4 shadow-md">
				{({ close }) => (
					<button
						type="button"
						className="rounded-md bg-rose-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
						onClick={() => {
							close()
							onConfirm()
						}}
					>
						Confirm
					</button>
				)}
			</Popover.Panel>
		</Popover>
	)
}

export const AddButton = ({ children }: PropsWithChildren) => {
	return (
		<Popover className="relative">
			<Popover.Button
				type="button"
				className="m-2 rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
			>
				<PlusIcon className="h-6 w-6" aria-hidden="true" />
			</Popover.Button>
			<Popover.Panel className="absolute z-10 mt-2 rounded bg-gray-100/70 p-4 shadow-md">
				{children}
			</Popover.Panel>
		</Popover>
	)
}

export const EditButton = ({ children }: PropsWithChildren) => {
	return (
		<Popover className="relative">
			<Popover.Button
				type="button"
				className="m-2 rounded-full bg-teal-600 p-2 text-white shadow-sm hover:bg-teal-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
			>
				<PencilSquareIcon className="h-6 w-6" aria-hidden="true" />
			</Popover.Button>
			<Popover.Panel className="absolute z-10 mt-2 rounded bg-gray-100/70 p-4 shadow-md">
				{children}
			</Popover.Panel>
		</Popover>
	)
}

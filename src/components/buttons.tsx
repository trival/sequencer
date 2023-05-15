import { Popover } from '@headlessui/react'
import { PlusIcon } from '@heroicons/react/20/solid'
import { TrashIcon } from '@heroicons/react/24/outline'
import { PropsWithChildren, ReactNode } from 'react'

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

import { useMemo, useState } from 'react'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { Combobox } from '@headlessui/react'
import clsx from 'clsx'
import { type } from 'os'

export interface SelectOption {
	value: string | number
	label: string
}

export interface SelectProps {
	options: SelectOption[]
	value?: string | number
	onSelect: (id: string | number) => void
	label?: string
	class?: string
}

export function ComboSelect({
	options,
	value,
	onSelect,
	label,
	class,
}: SelectProps) {
	const [query, setQuery] = useState('')

	const filteredOptions =
		query === ''
			? options
			: options.filter((option) => {
					return option.label.toLowerCase().includes(query.toLowerCase())
			  })

	const selectedOption = options.find((option) => option.value === value)

	return (
		<Combobox
			as="div"
			value={selectedOption}
			onChange={(opt) => onSelect(opt.value)}
		>
			{label && (
				<Combobox.Label class="mb-2 block text-sm font-medium leading-6 text-gray-900">
					{label}
				</Combobox.Label>
			)}
			<div class={clsx('relative', class)}>
				<Combobox.Input
					class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
					onChange={(event) => setQuery(event.target.value)}
					displayValue={(option: SelectOption) => option.label}
				/>
				<Combobox.Button class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
					<ChevronUpDownIcon
						class="h-5 w-5 text-gray-400"
						aria-hidden="true"
					/>
				</Combobox.Button>

				{filteredOptions.length > 0 && (
					<Combobox.Options class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
						{filteredOptions.map((option) => (
							<Combobox.Option
								key={option.value}
								value={option}
								class={({ active }) =>
									clsx(
										'relative cursor-default select-none py-2 pl-3 pr-9',
										active ? 'bg-indigo-600 text-white' : 'text-gray-900',
									)
								}
							>
								{({ active, selected }) => (
									<>
										<span
											class={clsx(
												'block truncate',
												selected && 'font-semibold',
											)}
										>
											{option.label}
										</span>

										{selected && (
											<span
												class={clsx(
													'absolute inset-y-0 right-0 flex items-center pr-4',
													active ? 'text-white' : 'text-indigo-600',
												)}
											>
												<CheckIcon class="h-5 w-5" aria-hidden="true" />
											</span>
										)}
									</>
								)}
							</Combobox.Option>
						))}
					</Combobox.Options>
				)}
			</div>
		</Combobox>
	)
}

export function Select({
	options,
	value,
	onSelect,
	label,
	class,
}: SelectProps) {
	const id = useMemo(() => Math.random().toString(36).substr(2, 9), [])
	return (
		<div class={class}>
			{label && (
				<label
					htmlFor={id}
					class="bb-2 block text-sm font-medium leading-6 text-gray-900"
				>
					{label}
				</label>
			)}
			<select
				id={id}
				value={value}
				onChange={(event) => onSelect(event.target.value)}
				class={clsx(
					'block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6',
				)}
			>
				{options.map((opt) => (
					<option key={opt.value} value={opt.value}>
						{opt.label}
					</option>
				))}
			</select>
		</div>
	)
}

interface InputProps {
	value?: string | number
	onChange: (value: string | number) => void
	type?: 'text' | 'email' | 'password' | 'number'
	class?: string
}

export const Input = ({
	value,
	onChange,
	type = 'text',
	class,
}: InputProps) => {
	return (
		<input
			type={type}
			value={value}
			onChange={(event) => onChange(event.target.value)}
			class={clsx(
				'rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
				class,
			)}
		/>
	)
}

import { For, mergeProps } from 'solid-js'
import clsx from 'clsx'

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

export function Select(props: SelectProps) {
	const id = Math.random().toString(36).substr(2, 9)
	return (
		<div class={props.class}>
			{props.label && (
				<label
					for={id}
					class="bb-2 block text-sm font-medium leading-6 text-gray-900"
				>
					{props.label}
				</label>
			)}
			<select
				id={id}
				value={props.value}
				onChange={(event) => props.onSelect(event.target.value)}
				class={clsx(
					'block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6',
				)}
			>
				<For each={props.options}>
					{(opt) => <option value={opt.value}>{opt.label}</option>}
				</For>
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

export const Input = (_props: InputProps) => {
	const props = mergeProps({ type: 'text' }, _props)
	return (
		<input
			type={props.type}
			value={props.value}
			onChange={(event) => props.onChange(event.target.value)}
			class={clsx(
				'rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
				props.class,
			)}
		/>
	)
}

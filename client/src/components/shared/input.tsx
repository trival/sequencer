import { createEffect, createSignal, For, mergeProps, Show } from 'solid-js'
import clsx from 'clsx'
import { ZodSchema } from 'zod'

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
	onBlur?: () => void
	type?: 'text' | 'email' | 'password' | 'number'
	class?: string
	required?: boolean
}

export const Input = (_props: InputProps) => {
	const props = mergeProps({ type: 'text' }, _props)
	return (
		<input
			class={clsx(
				'rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
				props.class,
			)}
			type={props.type}
			value={props.value}
			onInput={(event) => props.onChange(event.target.value)}
			onBlur={() => props.onBlur?.()}
			required={props.required}
		/>
	)
}

interface FormFieldProps extends InputProps {
	label: string
	error?: string
	schema?: ZodSchema
	onValidate?: (error: string | undefined) => void
}
export const FormField = (props: FormFieldProps) => {
	const [schemaError, setSchemaError] = createSignal<string | undefined>()
	const error = () => props.error || schemaError()

	function validate(value: FormFieldProps['value']) {
		const res = props.schema!.safeParse(value)
		if (!res.success) {
			const err = res.error.format()
			setSchemaError(err._errors.join(', '))
		} else {
			setSchemaError(undefined)
		}
	}

	createEffect(() => {
		if (props.onValidate) props.onValidate(error())
	})

	return (
		<label class={props.class}>
			<span class={clsx('block text-sm font-medium leading-6 text-gray-900')}>
				{props.label}
			</span>
			<Input
				class="mt-2 w-full"
				type={props.type}
				value={props.value}
				onChange={(val) => {
					if (schemaError()) validate(val)
					props.onChange(val)
				}}
				onBlur={props.schema && (() => validate(props.value))}
				required={props.required}
			/>
			<Show when={error()}>
				<span class="mt-1 text-sm text-red-600">{error()}</span>
			</Show>
		</label>
	)
}

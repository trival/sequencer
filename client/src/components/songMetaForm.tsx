import { createEffect, createSignal } from 'solid-js'
import { FormField } from './shared/input'
import { Button } from './shared/buttons'

interface SongMetaFormProps {
	title: string
	description: string
	onSubmit: (title: string, description: string) => void
}

export default function SongMetaForm(props: SongMetaFormProps) {
	const [title, setTitle] = createSignal('')
	const [description, setDescription] = createSignal('')

	function reset() {
		setTitle(props.title)
		setDescription(props.description)
	}

	// eslint-disable-next-line solid/reactivity
	reset()

	createEffect(() => reset())

	const isInitial = () =>
		props.title === title() && props.description === description()

	return (
		<form
			class="space-y-6"
			onSubmit={(e) => {
				e.preventDefault()
				props.onSubmit(title(), description())
			}}
		>
			<FormField
				label="Title"
				onChange={(val) => setTitle(val as string)}
				value={title()}
			/>
			<FormField
				label="Description"
				onChange={(val) => setDescription(val as string)}
				value={description()}
			/>

			<div>
				<Button
					type="button"
					color="white"
					disabled={isInitial()}
					onClick={() => reset()}
				>
					Abort
				</Button>
				<Button
					class="ml-4"
					type="submit"
					color="indigo"
					disabled={isInitial()}
				>
					Change
				</Button>
			</div>
		</form>
	)
}

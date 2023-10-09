import { createSignal } from 'solid-js'
import { FormField } from './Input'
import { Button } from './buttons'

interface SongMetaFormProps {
	onSubmit: (title: string, description: string) => void
}

export default function SongMetaForm(props: SongMetaFormProps) {
	const [title, setTitle] = createSignal('')
	const [description, setDescription] = createSignal('')
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
				<Button type="submit">Save</Button>
			</div>
		</form>
	)
}

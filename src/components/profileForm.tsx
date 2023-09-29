import { createSignal } from 'solid-js'
import { FormField } from './Input'
import { Button } from './buttons'

interface ProfileFormProps {
	onSubmit: (username: string, color: string) => void
}
export default function ProfileForm(props: ProfileFormProps) {
	const [username, setUsername] = createSignal('')
	const [color, setColor] = createSignal('')
	return (
		<form class="space-y-6">
			<FormField
				label="Username"
				onChange={(val) => setUsername(val as string)}
				value={username()}
			/>
			<FormField
				label="Color"
				onChange={(val) => setColor(val as string)}
				value={color()}
			/>

			<div>
				<Button type="submit">Save</Button>
			</div>
		</form>
	)
}

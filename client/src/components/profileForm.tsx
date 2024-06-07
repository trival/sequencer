import { createEffect, createSignal } from 'solid-js'
import { FormField } from './Input'
import { Button } from './buttons'

interface ProfileFormProps {
	username: string
	color?: string
	onSubmit: (username: string, color: string) => void
}
export default function ProfileForm(props: ProfileFormProps) {
	const [username, setUsername] = createSignal('')
	const [color, setColor] = createSignal('')

	function reset() {
		setUsername(props.username)
		setColor(props.color || '')
	}

	// eslint-disable-next-line solid/reactivity
	reset()

	createEffect(() => reset())

	const isInitial = () =>
		props.username === username() && props.color === color()

	return (
		<form
			class="space-y-6"
			onSubmit={(e) => {
				e.preventDefault()
				props.onSubmit(username(), color())
			}}
		>
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
					Save
				</Button>
			</div>
		</form>
	)
}

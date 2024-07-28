import { useAppState } from '@/AppState'
import { FormField } from './shared/input'
import { z } from 'zod'
import { createSignal } from 'solid-js'
import { Button } from './shared/buttons'

const usernameSchema = z.string().min(3).max(32)
const passwordSchema = z.string().min(8).max(32)
const emailSchema = z.string().email()
const confirmPasswordSchema = (password: string) =>
	z.string().refine((val) => val === password, 'Passwords do not match')
const confirmEmailSchema = (email: string) =>
	z.string().refine((val) => val === email, 'Emails do not match')

export const LoginForm = () => {
	const [_, { session }] = useAppState()
	const [username, setUsername] = createSignal('')
	const [password, setPassword] = createSignal('')
	const [usernameError, setUsernameError] = createSignal<string | undefined>()
	const [passwordError, setPasswordError] = createSignal<string | undefined>()

	const disabled = () =>
		!username() || !password() || !!usernameError() || !!passwordError()

	function onSubmit() {
		session().login(username(), password())
		setUsername('')
		setPassword('')
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				onSubmit()
			}}
			class="flex w-full flex-col gap-4"
		>
			<FormField
				label="User name"
				value={username()}
				onChange={setUsername}
				schema={usernameSchema}
				onValidate={setUsernameError}
				required
			/>
			<FormField
				label="Password"
				value={password()}
				onChange={setPassword}
				schema={passwordSchema}
				onValidate={setPasswordError}
				type="password"
				required
			/>
			<Button type="submit" class="mt-6" disabled={disabled()}>
				Login
			</Button>
		</form>
	)
}

export const RegisterForm = () => {
	const [_, { session }] = useAppState()
	const [username, setUsername] = createSignal('')
	const [password, setPassword] = createSignal('')
	const [email, setEmail] = createSignal('')
	const [confirmPassword, setConfirmPassword] = createSignal('')
	const [confirmEmail, setConfirmEmail] = createSignal('')
	const [usernameError, setUsernameError] = createSignal<string | undefined>()
	const [passwordError, setPasswordError] = createSignal<string | undefined>()
	const [emailError, setEmailError] = createSignal<string | undefined>()
	const [confirmPasswordError, setConfirmPasswordError] = createSignal<
		string | undefined
	>()
	const [confirmEmailError, setConfirmEmailError] = createSignal<
		string | undefined
	>()

	const disabled = () =>
		!username() ||
		!password() ||
		!email() ||
		!confirmPassword() ||
		!confirmEmail() ||
		!!usernameError() ||
		!!passwordError() ||
		!!emailError() ||
		!!confirmPasswordError() ||
		!!confirmEmailError()

	function onSubmit() {
		session().register(username(), password(), email())
		setUsername('')
		setPassword('')
		setEmail('')
		setConfirmPassword('')
		setConfirmEmail('')
	}

	return (
		<form
			class="flex w-full flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault()
				onSubmit()
			}}
		>
			<FormField
				label="User name"
				value={username()}
				onChange={setUsername}
				schema={usernameSchema}
				onValidate={setUsernameError}
				required
			/>
			<FormField
				label="Password"
				value={password()}
				onChange={setPassword}
				schema={passwordSchema}
				onValidate={setPasswordError}
				type="password"
				required
			/>
			<FormField
				label="Confirm password"
				value={confirmPassword()}
				onChange={setConfirmPassword}
				schema={confirmPasswordSchema(password())}
				onValidate={setConfirmPasswordError}
				type="password"
				required
			/>
			<FormField
				label="Email"
				value={email()}
				onChange={setEmail}
				schema={emailSchema}
				onValidate={setEmailError}
				type="email"
				required
			/>
			<FormField
				label="Confirm email"
				value={confirmEmail()}
				onChange={setConfirmEmail}
				schema={confirmEmailSchema(email())}
				onValidate={setConfirmEmailError}
				type="email"
				required
			/>

			<Button type="submit" class="mt-6" disabled={disabled()}>
				Register
			</Button>
		</form>
	)
}

export const Login = () => {
	const [useRegister, setUseRegister] = createSignal(false)

	return (
		<div class="flex flex-col items-center gap-4">
			<h1 class="text-2xl font-bold">
				{useRegister() ? 'Create new account' : 'Login'}
			</h1>
			{useRegister() ? <RegisterForm /> : <LoginForm />}
			<button
				class="mt-4 text-blue-500 hover:underline"
				onClick={() => setUseRegister(!useRegister())}
			>
				{useRegister() ? 'Login with existing account' : 'Create new account'}
			</button>
			{
				// TODO
				/* <Button>Forgot password</Button> */
			}
		</div>
	)
}

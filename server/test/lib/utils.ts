import type { TRPCError } from '@trpc/server'

export const catchError = async (fn: () => Promise<any>) => {
	let error: any
	let result: any
	try {
		result = await fn()
	} catch (e) {
		error = e
	}

	if (!error) {
		console.log('Expected an error but got:', result)
		throw new Error('Expected an error')
	}

	return error
}

export const checkErrorCode = async (
	code: TRPCError['code'],
	fn: () => Promise<any>,
) => {
	const error = await catchError(fn)
	if (error.code !== code) {
		console.log('Expected error code', code, 'but got:', error.code)
		throw new Error('Expected error code')
	}
}

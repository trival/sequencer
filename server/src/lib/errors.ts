import { TRPCError } from '@trpc/server'

export const apiError = (code: TRPCError['code'], message?: string) => {
	return new TRPCError({
		code,
		message,
	})
}

import { z } from 'zod'

export const registerInputSchema = z.object({
	username: z.string().min(3),
	email: z.string().email(),
	password: z.string().min(8),
})

export type RegisterInput = z.infer<typeof registerInputSchema>

export const profileUpdateInputSchema = z.object({
	username: z.string().optional(),
	isPublic: z.boolean().optional(),
	color: z.string().optional(),
	email: z.string().email().optional(),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateInputSchema>

export interface PublicProfile {
	id: string
	username: string
	color: string
}

export interface Profile extends PublicProfile {
	createdAt: Date
	email: string
	isPublic: boolean
}

export interface Account extends Profile {
	passwordHash: string
}

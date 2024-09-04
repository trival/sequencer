import { Buffer } from 'node:buffer'

export const wait = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms))

export const uuid = () => crypto.randomUUID()

export function changes<T>(oldT: T, newT: T, skip?: (keyof T)[]): Partial<T> {
	const result: Partial<T> = {}
	for (const key in newT) {
		if (newT[key] === undefined) {
			continue
		}
		if (skip?.includes(key as keyof T)) {
			continue
		}
		if (!isEqual(oldT[key], newT[key])) {
			result[key] = newT[key]
		}
	}
	return result
}

function isEqual(a: any, b: any): boolean {
	if (a === b) {
		return true
	}
	if (a instanceof Date && b instanceof Date) {
		return a.getTime() === b.getTime()
	}
	if (a instanceof Array && b instanceof Array) {
		return a.length === b.length && a.every((v, i) => isEqual(v, b[i]))
	}
	if (a instanceof Buffer && b instanceof Buffer) {
		return a.equals(b)
	}
	if (a instanceof Object && b instanceof Object) {
		return JSON.stringify(a) === JSON.stringify(b)
	}
	return false
}

export function changes<T>(oldT: T, newT: T, skip?: (keyof T)[]): Partial<T> {
	const result: Partial<T> = {}
	for (const key in newT) {
		if (newT[key] === undefined) {
			continue
		}
		if (skip?.includes(key as keyof T)) {
			continue
		}
		if (oldT[key] !== newT[key]) {
			result[key] = newT[key]
		}
	}
	return result
}

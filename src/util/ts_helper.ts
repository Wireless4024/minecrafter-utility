export function omit<T, A extends keyof T>(obj: T, ...fields: A[]): Omit<T, A> {
	const res: T = Object.assign({}, obj)
	for (const field of fields) {
		delete res[field]
	}
	return res as T
}

export function notnull<T>(obj: T | null | undefined): NonNullable<T> {
	if (obj === null || obj === undefined) throw Error('Non-Null assertion failed')
	return obj
}
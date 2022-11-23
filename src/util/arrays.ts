export function binarySearch<T>(ar: T[], el: T, compare_fn: (a: T, b: T) => number): number {
	let m = 0
	let n = ar.length - 1
	while (m <= n) {
		const k = (n + m) >> 1
		const cmp = compare_fn(el, ar[k])
		if (cmp > 0) {
			m = k + 1
		} else if (cmp < 0) {
			n = k - 1
		} else {
			return k
		}
	}
	return -m - 1
}

export const COMPARE_NUMBER = (a: number, b: number) => a - b
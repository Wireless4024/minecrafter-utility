const ENERGY_UNIT = ['', 'K', 'M', 'B', 'T']

export function fmt_energy(amount: number, digits = 3): string {
	let buf = amount
	let k = 0
	while (buf > 1000) {
		++k
		buf = buf / 1000
	}
	return buf.toFixed(digits) + ' ' + ENERGY_UNIT[k] + 'FE'
}
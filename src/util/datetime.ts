export const EN_GB: Intl.DateTimeFormat = new Intl.DateTimeFormat("en-GB", {
	day  : "numeric",
	month: "short",
	year : "numeric"
})

export async function get_interval_delay(): Promise<number> {
	let tick = 0
	const date = [0, 0]
	return new Promise(function (ok) {
		const ival = setInterval(function () {
			if (tick == 1) {
				date[tick] = Date.now()
				clearInterval(ival)
				ok(date[1] - date[0])
			} else if (tick == 0) {
				date[tick] = Date.now()
				++tick
			}
		}, 1)
	})
}
import {
	binarySearch,
	COMPARE_NUMBER
} from "../../util/arrays"
import {
	TICK_PER_SEC,
	TICKS_PER_DAY
} from "./constants"

const TIME_SCALE = [0, 1000, 6000, 12000, 13000, 23000, 24000]
const TIME_SECTIONS = TIME_SCALE.length - 1
const TIME_SCALE_NAME = ["Morning", "Day", "Afternoon", "Dusk", "Night", "Dawn", "Morning"]

function getTimeSection(tick: number): number {
	let found = binarySearch(TIME_SCALE, tick, COMPARE_NUMBER)
	if (found < 0) {
		found = ~found - 1
	}
	return found
}

export function getTimeName(tick: number) {
	return TIME_SCALE_NAME[getTimeSection(tick)]
}

export function getTimeNameInSec(now: number, secs: number) {
	const tick = now + (TICK_PER_SEC * secs)
	return getTimeName(tick % TICKS_PER_DAY)
}

export function computeTable(_now: number): [string, number][] {
	const table: [string, number][] = []
	let now = _now % TICKS_PER_DAY
	let current_section = getTimeSection(now)
	for (let i = 0; i < TIME_SECTIONS; i++) {
		current_section = current_section + 1;
		if (current_section == TIME_SECTIONS) {
			current_section = 0
			now -= TICKS_PER_DAY
		}
		table.push([TIME_SCALE_NAME[current_section], TIME_SCALE[current_section] - now])
	}
	return table
}

export function computeSleepTime(_now: number) {
	const now = _now % 24000
	const current_section = getTimeSection(now)
}
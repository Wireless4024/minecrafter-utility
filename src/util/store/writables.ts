import {get_store_value} from "svelte/internal"
import type {
	Subscriber,
	Unsubscriber,
	Updater,
	Writable
}                        from "svelte/store"
import {writable}        from "svelte/store"

class NumericWritable implements Writable<number> {
	private inner = writable(0)

	constructor(init: number) {this.inner.set(init)}

	set(value: number): void {
		this.inner.set(value)
	}

	subscribe(run: Subscriber<number>, invalidate?: (value?: number) => void): Unsubscriber {
		return this.inner.subscribe(run, invalidate)
	}

	update(updater: Updater<number>): void {
		this.inner.update(updater)
	}

	add(delta: number) {
		this.inner.update(it => it + delta)
	}

	get(): number {
		return get_store_value(this.inner)
	}

	balance(ratio: number, target: NumericWritable) {
		const right = target.get()
		this.update(left => {
			const total = left + right
			const l = total * ratio
			target.set(total - l)
			return l
		})
	}
}

class IntWritable implements Writable<number> {
	private inner = writable(0)

	constructor(init: number) {this.inner.set(~~init)}

	set(value: number): void {
		this.inner.set(~~value)
	}

	subscribe(run: Subscriber<number>, invalidate?: (value?: number) => void): Unsubscriber {
		return this.inner.subscribe(run, invalidate)
	}

	update(updater: Updater<number>): void {
		this.inner.update(function (it) {
			return ~~updater(it)
		})
	}

	add(delta: number) {
		this.inner.update(it => ~~(it + delta))
	}

	get(): number {
		return get_store_value(this.inner)
	}
}

export function writable_number(init = 0): NumericWritable {
	return new NumericWritable(init)
}

export function writable_int(init = 0): IntWritable {
	return new IntWritable(init)
}
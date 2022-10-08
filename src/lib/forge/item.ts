import {FluidUnit} from "./fluid"

export class ItemQuantity {
	constructor(public readonly nuggets: number) {}

	get fluid(): FluidUnit {
		return new FluidUnit(this.nuggets * 16)
	}

	get ingots() {
		return this.nuggets / 9
	}

	get blocks() {
		return this.ingots / 9
	}

	toString(): string {
		const blocks = ~~(this.blocks)
		const ingots = ~~(this.ingots % 9)
		const nuggets = ~~(this.nuggets % 9)
		if (blocks == ingots && ingots == 0 && ingots == nuggets) return "0"
		let str = ''
		if (blocks > 0) {
			str += blocks + ' block'
			if (blocks > 1) str += 's'
			str += ' '
		}
		if (ingots > 0) {
			str += ingots + ' ingot'
			if (ingots > 1) str += 's'
			str += ' '
		}
		if (nuggets > 0) {
			str += nuggets + ' nugget'
			if (nuggets > 1) str += 's'
			str += ' '
		}
		return str
	}

	static from_block(n: number): ItemQuantity {
		return ItemQuantity.from_ingot(n * 9)
	}

	static from_ingot(n: number): ItemQuantity {
		return new ItemQuantity(n * 9)
	}

	static from_fluid(mb: number): ItemQuantity {
		return new ItemQuantity(mb / 16)
	}
}
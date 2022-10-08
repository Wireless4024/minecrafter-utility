export class FluidUnit {
	constructor(public readonly milli_bucket: number) {}
}

export function fluid_bucket(b: number) {
	return new FluidUnit(b * 1000)
}
import {get_store_value} from "svelte/internal"
import type {Writable}   from "svelte/store"
import {writable}        from "svelte/store"
import {compute_ratio}   from "../../util/math"
import {writable_number} from "../../util/store/writables"

// https://github.com/Draconic-Inc/Draconic-Evolution/blob/e6385a71346768a13e3fc768526a378863f0fbc0/src/main/java/com/brandon3055/draconicevolution/blocks/reactor/tileentity/TileReactorCore.java

type ReactorState =
	| 'INVALID'
	| 'COLD'
	| 'WARMING_UP'
	| 'RUNNING'
	| 'STOPPING'
	| 'COOLING'
	| 'BEYOND_HOPE'

class DraconicReactor {
	tick_rate = writable_number(50)
	fuel = writable_number()
	used_fuel = writable_number()

	temperature = writable_number()

	shield = writable_number()
	max_shield = writable_number()

	energy = writable_number()
	max_energy = writable_number()

	temp_drain_factor = writable_number()
	generation_rate = writable_number()
	field_drain = writable_number()
	field_input_rate = writable_number()
	fuel_use_rate = writable_number()

	input_rate = writable_number()
	consume_rate = writable_number()
	output_rate = writable_number()
	fuel_convert_ratio = writable_number(0)

	state: Writable<ReactorState> = writable("COLD")

	startup_initialized = writable(false)

	used_subscribe = writable_number()

	_tick = writable_number()

	private tick_id = 0
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	private unsub_tick: () => void = () => {}

	change_status = writable(false)

	constructor() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const self = this
		/*this.change_status.subscribe(function (it) {
			if (it && !self.can_activate()) {
				self.change_status.set(false)
			} else {
				if (it)
					self.activate()
				else
					self.shutdown()
			}
		})*/
		/*const fuel = this.reactor_fuel
		fuel.subscribe(it => {if (it != it) fuel.set(0)})
		const temp = this.temperature
		temp.subscribe(it => {if (it != it) temp.set(0)})*/
		this.fuel.subscribe(() => {
			self.compute_fuel()
		})
		this.fuel_convert_ratio.subscribe(it => {
			self.used_fuel.balance(it / 1_000_000, self.fuel)
		})
	}

	tick() {
		this.transfer_energy()
		this._tick.update(it => it + 1)
		this.update_core_logic()
	}

	update_core_logic() {
		switch (get_store_value(this.state)) {
			case 'INVALID':
				this.updateOfflineState()
				break
			case 'COLD':
				this.updateOfflineState()
				break
			case 'WARMING_UP':
				this.init_startup()
				break
			case 'RUNNING':
				this.updateOnlineState()
				break
			case 'STOPPING':
				this.updateOnlineState()
				if (this.temperature.get() <= 2000) {
					this.state.set('COOLING')
				}
				break
			case 'COOLING':
				this.updateOfflineState()
				if (this.temperature.get() <= 100) {
					this.state.set('COLD')
				}
				break
			case 'BEYOND_HOPE':
				this.updateCriticalState()
				break
		}
	}

	compute_fuel() {
		const total_fuel = this.fuel.get() + this.used_fuel.get()
		const shield = total_fuel * 96.45061728395062 * 100
		this.max_shield.set(shield)
		this.max_energy.set(shield * 10)

		if (this.energy.get() > this.max_energy.get()) {
			this.energy.set(this.max_energy.get())
		}

		if (this.shield.get() > this.max_shield.get()) {
			this.shield.set(this.max_shield.get())
		}
	}

	init_startup() {
		const initialized = get_store_value(this.startup_initialized)
		if (!initialized) {
			console.info("initializing reactor")
			if (this.tick_id == 0) {
				console.info("spawning task to tick reactor")
				// eslint-disable-next-line @typescript-eslint/no-this-alias
				const self = this
				let __tick = 0
				let tick_on = 50
				this.unsub_tick = self.tick_rate.subscribe(it => {
					tick_on = it
					__tick = 0
				})
				this.tick_id = setInterval(function () {
					if (__tick == tick_on) {
						self.tick()
						__tick = 0
					}
					++__tick
				}, 1)
			}

			this.compute_fuel()

			this.startup_initialized.set(true)
		}
	}

	charge_reactor() {
		if (this.can_charge()) {
			this.state.set('WARMING_UP')
		}
	}

	activate() {
		if (this.can_activate()) {
			this.state.set('RUNNING')
		}
	}

	can_charge(): boolean {
		const state = get_store_value(this.state)
		if (state == 'BEYOND_HOPE') {
			return false
		}

		return (state == 'COLD' || state == 'COOLING') && this.fuel.get() + this.used_fuel.get() >= 144
	}

	can_activate() {
		const state = get_store_value(this.state)
		return (state == 'WARMING_UP' || state == 'STOPPING')
			&& this.temperature.get() >= 2000
			&& ((this.energy.get() >= this.max_energy.get() / 2
					&& this.shield.get() >= this.max_shield.get() / 2)
				|| state == 'STOPPING')

	}

	shutdown() {
		this.state.set("STOPPING")
	}

	updateOfflineState() {
		if (this.temperature.get() > 20) {
			this.temperature.update(it => it - .5)
		}
		const shield_charge = this.energy.get()
		if (shield_charge > 0) {
			const max_shield = this.max_shield.get()
			this.shield.add(-(max_shield * 0.0005 * Math.random()))
		} else if (shield_charge < 0) {
			this.shield.set(0)
		}
		const saturation = this.energy.get()
		if (saturation > 0) {
			const max_sat = this.max_energy.get()
			this.energy.add(-(max_sat * 0.000002 * Math.random()))
		} else if (saturation < 0) {
			this.energy.set(0)
		}
	}

	updateCriticalState() {
		this.shield.set(Math.random() * (Math.max(1, (this.max_shield.get() * 0.01))))
		this.temperature.set(approachExp(this.temperature.get(), 12000, 0.0005))
	}

	updateOnlineState() {
		const temp = this.temperature.get()
		const max_energy = this.max_energy.get()
		const fuel = this.fuel.get()
		const saturation = this.energy.get() / max_energy
		const negCSat = (1 - saturation) * 99
		const used_fuel = this.used_fuel.get()
		const temp50 = Math.min((temp / 10_000) * 50, 99)
		const total_fuel = used_fuel + fuel
		const convLVL = ((used_fuel / total_fuel) * 1.3) - 0.3
		const tempOffset = 444.7

		const tempRiseExpo = (negCSat * negCSat * negCSat) / (100 - negCSat) + tempOffset
		const tempRiseResist = (temp50 * temp50 * temp50 * temp50) / (100 - temp50)
		const riseAmount = (tempRiseExpo - (tempRiseResist * (1 - convLVL)) + convLVL * 1000) / 10000

		if (get_store_value(this.state) == 'STOPPING' && convLVL < 1) {
			if (temp <= 2001) {
				this.state.set('COOLING')
				this.startup_initialized.set(false)
				return
			}
			if (this.energy.get() >= max_energy * 0.99 && fuel > 0) {
				this.temperature.add(-(1 - convLVL))
			} else {
				this.temperature.add(riseAmount * 10)
			}
		} else {
			this.temperature.add(riseAmount * 10)
		}

		const baseMaxRFt = ((max_energy / 1000) * 15)
		const maxRFt = (baseMaxRFt * (1 + (convLVL * 2)))

		const generation_rate = (1 - saturation) * maxRFt
		this.generation_rate.set(generation_rate)
		this.energy.add(generation_rate)

		const temperature = this.temperature.get()
		this.temp_drain_factor.set(temperature > 8000 ? 1 + ((temperature - 8000) * (temperature - 8000) * 0.0000025) : temperature > 2000 ? 1 : temperature > 1000 ? (temperature - 1000) / 1000 : 0)
		this.field_drain.set(
			Math.min(this.temp_drain_factor.get() * Math.max(0.01, (1 - saturation)) * (baseMaxRFt / 10.923556), 2147483647))

		const fieldNegPercent = 1 - (this.shield.get() / this.max_shield.get())
		this.field_input_rate.set(this.field_drain.get() / fieldNegPercent)
		this.shield.add(-Math.min(this.field_drain.get(), this.shield.get()))

		const fuel_use_rate = this.temp_drain_factor.get() * (1 - saturation) * (0.005)
		this.fuel_use_rate.set(fuel_use_rate)
		if (this.fuel.get() > 0) {
			this.used_fuel.add(this.fuel_use_rate.get())
			this.fuel.add(-this.fuel_use_rate.get())
			this.used_subscribe.set(compute_ratio(total_fuel, used_fuel + fuel_use_rate, 100))
		}
	}

	inject_energy(energy: number) {
		let received = 0;
		const state = get_store_value(this.state)
		if (state == 'WARMING_UP') {
			if (!get_store_value(this.startup_initialized)) {
				return 0;
			}
			if (this.shield.get() < (this.max_shield.get() / 2)) {
				received = Math.min(energy, (this.max_shield.get() / 2) - this.shield.get() + 1);
				this.shield.add(received);
				if (this.shield.get() > (this.max_shield.get() / 2)) {
					this.shield.set(this.max_shield.get() / 2);
				}
			} else if (this.energy.get() < (this.max_energy.get() / 2)) {
				received = Math.min(energy, (this.max_energy.get() / 2) - this.energy.get());
				this.energy.add(received);
			} else if (this.temperature.get() < 2000) {
				received = energy;
				this.temperature.add(received / (1000 + (this.fuel.get() * 10)));
				if (this.temperature.get() > 2500) {
					this.temperature.set(2500);
				}
			}
		} else if (state == 'RUNNING' || state == 'STOPPING') {
			let tempFactor = 1;

			//If the temperature goes past 15000 force the shield to drain by the time it hits 25000 regardless of input.
			if (this.temperature.get() > 15000) {
				tempFactor = 1 - Math.min(1, (this.temperature.get() - 15000) / 10000);
			}

			this.shield.add(Math.min((energy * (1 - (this.shield.get() / this.max_shield.get()))), this.max_shield.get() - this.shield.get()) * tempFactor);
			if (this.shield.get() > this.max_shield.get()) {
				this.shield.set(this.max_shield.get());
			}

			return energy;
		}
		return received;
	}

	transfer_energy() {
		const input = this.input_rate.get()
		if (input > 0) {
			this.consume_rate.set(this.inject_energy(input))
		}
		const status = get_store_value(this.state)

		if (status == 'RUNNING') {
			const extract_rate = this.output_rate.get()
			if (extract_rate > 0)
				this.energy.update(it => {
					if (it > extract_rate)
						return it - extract_rate
					else
						return it
				})
		}
	}

	destroy() {
		if (this.tick_id) {
			clearInterval(this.tick_id)
			this.unsub_tick()
			this.tick_id = 0
		}
	}
}

function approachExp(a: number, b: number, ratio: number) {
	return a + (b - a) * ratio
}

export function create_reactor(): DraconicReactor {
	return new DraconicReactor()
}
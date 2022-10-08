import {writable} from "svelte/store"

export const title = writable("Minecrafter Utility")

export function reset_title(){
	title.set("Minecrafter Utility")
}
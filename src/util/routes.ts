import type {
	AsyncSvelteComponent,
	WrappedComponent
}              from "svelte-spa-router"
import wrap    from "svelte-spa-router/wrap"
import Loading from "../page/Loading.svelte"

type RouteInfo = {
	name: string
	description?: string
	icon?: string
	group?: string
}

class RouteBuilder {
	routes: Record<string, WrappedComponent> = {}
	private metadata: Record<string, RouteInfo> = {}

	add(path: string, comp: WrappedComponent, meta: RouteInfo): this {
		this.routes[path] = comp
		this.metadata[path] = meta
		return this
	}

	build_navigation(): Record<string, Array<Omit<RouteInfo, "group"> & { path: string }>> {
		const groups: Record<string, Array<Omit<RouteInfo, "group"> & { path: string }>> = {"": []}
		const meta = this.metadata
		for (const path in meta) {
			const route_meta = meta[path]
			const {group, ...info} = route_meta
			const routes = groups[group || ""] || []
			routes.push(Object.assign({path}, info))
			groups[group || ""] = routes
		}
		return groups
	}
}

function component(asyncComponent: AsyncSvelteComponent) {
	return wrap({
		asyncComponent,
		loadingComponent: Loading
	})
}

const builder = new RouteBuilder()
	.add('/',
		component(() => import('../page/Home.svelte')),
		{name: 'Home', description: 'home page', icon: 'home'})
	.add('/vanilla/time',
		component(() => import('../page/vanilla/TimeCalculator.svelte')),
		{name: 'Time calculator', icon: "access_time", group: "Vanilla"})
	.add('/draconic_evo/reactor',
		component(() => import('../page/draconic_evolution/Reactor.svelte')),
		{name: 'DE Reactor Simulation', group: "Forge-mod"})

export const navigations: Record<string, Array<Omit<RouteInfo, "group"> & { path: string }>> = builder.build_navigation()
export default builder.routes
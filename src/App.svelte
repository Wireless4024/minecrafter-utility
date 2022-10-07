<svelte:head>
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,600,700">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Ubuntu+Mono">
</svelte:head>
<script lang="ts">
	import Router from "svelte-spa-router"
	import AppBar from "./lib/AppBar.svelte"
	import routes from "./util/routes.js"
</script>
<AppBar>
	<main>
		<Router {routes}/>
	</main>
</AppBar>
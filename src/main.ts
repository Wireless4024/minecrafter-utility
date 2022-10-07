import './app.css'
import App       from './App.svelte'
import {notnull} from "./util/ts_helper"

const app = new App({
	target: notnull(document.getElementById('app'))
})

export default app

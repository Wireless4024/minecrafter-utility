<script lang="ts">
    import {
        Graphic,
        Item,
        Text
    } from "@smui/list"
    import {
        location,
        push
    } from "svelte-spa-router"

    export let icon: string = "more_horiz"
    export let href: string = "/"
    export let description: string = ""

    let activated: boolean
    $:{
        const loc = $location
        activated = href.endsWith('s') ? loc.startsWith(href.substring(0, href.length - 1)) : href === loc
    }
</script>
<Item href="javascript:void(0)" on:click={()=>push(href)} {activated}>
    <Graphic class="material-icons" aria-hidden="true"
             aria-label={description}>{icon}</Graphic>
    <Text>
        <slot></slot>
    </Text>
</Item>
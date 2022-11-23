<script lang="ts">
    import Button    from "@smui/button"
    import DataTable, {
        Body,
        Cell,
        Head,
        Row
    }                from "@smui/data-table"
    import FormField from "@smui/form-field"
    import Slider    from "@smui/slider"
    import {
        onDestroy,
        onMount
    }                from "svelte"
    import Container from "../../lib/Container.svelte"
    import {
        TICK_PER_SEC,
        TICKS_PER_DAY
    }                from "../../lib/vanilla/constants.js"
    import {
        computeTable,
        getTimeName,
        getTimeNameInSec
    }                from "../../lib/vanilla/time.js"
    import {
        reset_title,
        title
    }                from "../../util/shared_state"

    let now = 0
    let next_mins = 0

    let ival = 0

    let table: [string, number][]
    $:table = computeTable(now + (next_mins * TICK_PER_SEC * 60))

    let show_sleep_option
    $:show_sleep_option = now >= 13000

    onMount(function () {
        $title = "Time calculator"
        ival = setInterval(function () {
            if (now + 20 >= TICKS_PER_DAY)
                now = 0
            else
                now += 20
        }, 1000)
    })
    onDestroy(function () {
        reset_title()
        if (ival) clearInterval(ival)
    })
</script>
<Container>
    <div>Current tick: {now}</div>
    <div>Current time: {getTimeName(now)}</div>
    <div>Time in {next_mins} minutes: {getTimeNameInSec(now, next_mins * 60)}</div>
    {#if show_sleep_option}
        <div>Sleep now to get: {getTimeName((next_mins * 60 * 20) % TICKS_PER_DAY)} within {next_mins} minutes</div>
    {/if}
    <FormField align="end" style="display: flex;">
        <Slider style="flex-grow: 1;" bind:value={now} min="0" max={TICKS_PER_DAY-20} step="20"/>
        <span slot="label" style="padding-right: 12px; width: max-content; display: block;">Tick</span>
    </FormField>
    <FormField align="end" style="display: flex;">
        <Slider style="flex-grow: 1;" bind:value={next_mins} min="0" max="99" step="1"/>
        <span slot="label" style="padding-right: 12px; width: max-content; display: block;">Time in minutes</span>
    </FormField>
    <div>
        <h5>Actions</h5>
        {#if show_sleep_option}
            <Button color="secondary" variant="raised" on:click={()=>(now = 0)}>Sleep</Button>
        {/if}
    </div>
    <div>
        <h2>Table of time from now + {next_mins} minutes</h2>
        <DataTable table$aria-label="Time in future">
            <Head>
                <Row>
                    <Cell>Time</Cell>
                    <Cell>Remain in minutes</Cell>
                    <Cell>Remain in tick</Cell>
                </Row>
            </Head>
            <Body>
            {#each table as t}
                <Row>
                    <Cell>{t[0]}</Cell>
                    <Cell>{~~(t[1] / 60 / 20)}</Cell>
                    <Cell>{t[1]}</Cell>
                </Row>
            {/each}
            </Body>
        </DataTable>
    </div>
</Container>
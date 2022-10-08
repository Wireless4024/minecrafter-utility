<script lang="ts">
    import Button, {Label}      from '@smui/button';
    import DataTable, {
        Body,
        Cell,
        Head,
        Row
    }                           from '@smui/data-table';
    import FormField            from '@smui/form-field';
    import Slider               from '@smui/slider';
    import {
        onDestroy,
        onMount
    }                           from "svelte"
    import Container            from "../../lib/Container.svelte";
    import {create_reactor}     from "../../lib/draconic_evolution/reactor"
    import {fmt_energy}         from "../../lib/forge/energy.js";
    import {ItemQuantity}       from "../../lib/forge/item.js";
    import {get_interval_delay} from "../../util/datetime"
    import {
        reset_title,
        title
    }                           from "../../util/shared_state"

    const reactor = create_reactor()

    let interval_delay = 1
    let delay_check: number
    onMount(function () {
        delay_check = setInterval(async function () {
            interval_delay = await get_interval_delay()
        }, 1000)
        $title = 'Draconic Reactor Simulation'
    })

    onDestroy(function () {
        reactor.destroy()
        clearInterval(delay_check)
        reset_title()
    })

    const temperature = reactor.temperature
    const saturation = reactor.energy
    const saturation_max = reactor.max_energy
    const shield = reactor.shield
    const shield_max = reactor.max_shield
    const generation_rate = reactor.generation_rate
    const fuel_use_rate = reactor.fuel_use_rate
    const field_drain = reactor.field_drain
    const activate = reactor.change_status
    const init = reactor.startup_initialized
    let power_scale = 5

    const input_rate = reactor.input_rate
    const output_rate = reactor.output_rate
    const consume_rate = reactor.consume_rate

    const fuel = reactor.fuel
    const consumed = reactor.used_fuel

    const state = reactor.state
    const tick = reactor._tick
    const tick_rate = reactor.tick_rate
    const fuel_use_ratio = reactor.fuel_convert_ratio
    const used_sub = reactor.used_subscribe
</script>
<Container>
    <div>
        {#if !$init}
            <Button on:click={() => reactor.init_startup()} variant="raised">
                <Label>Initialize reactor</Label>
            </Button>
        {:else}
            {#if $state == 'COLD'}
                <Button on:click={() => reactor.charge_reactor()} variant="raised">
                    <Label>Charge reactor</Label>
                </Button>
            {:else if $state != 'RUNNING'}
                <Button on:click={() => reactor.activate()} disabled={$temperature<2000} variant="raised">
                    <Label>Activate</Label>
                </Button>
            {:else}
                <Button on:click={() => reactor.shutdown()} disabled={$temperature<2000} variant="raised">
                    <Label>Shutdown</Label>
                </Button>
            {/if}
        {/if}
        <FormField align="end" style="display: flex;">
            <Slider style="flex-grow: 1;" bind:value={power_scale} min="1" max="30" step="1"/>
            <span slot="label" style="padding-right: 12px; width: max-content; display: block;">
                Power scale ({power_scale} Million)
            </span>
        </FormField>
        {#if $state == 'COLD'}
            <FormField align="end" style="display: flex;">
                <Slider style="flex-grow: 1;" bind:value={$fuel} min="0" max="10368" step="16"/>
                <span slot="label" style="padding-right: 12px; width: max-content; display: block;">
                Fuel (144 = 1 ingot)
            </span>
            </FormField>
        {:else}
            <FormField align="end" style="display: flex;">
                <Slider style="flex-grow: 1;" bind:value={$fuel_use_ratio} min="0" max="1000000"/>
                <span slot="label" style="padding-right: 12px; width: max-content; display: block;">
              Fuel used {$used_sub.toFixed(6)}%
            </span>
            </FormField>
        {/if}
        <FormField align="end" style="display: flex;">
            <Slider style="flex-grow: 1;" bind:value={$tick_rate} min="1" max="50" step="1"/>
            <span slot="label" style="padding-right: 12px; width: max-content; display: block;">
                Tick rate (~{~~((1000 / $tick_rate) / interval_delay)}/s)
            </span>
        </FormField>
    </div>
    <div>
        <FormField align="end" style="display: flex;width: 100%">
            <Slider style="flex-grow: 1" bind:value={$input_rate} max={power_scale*1000000}/>
            <span slot="label" style="padding-right: 12px; width: max-content; display: block;">
                Energy input
            </span>
        </FormField>
        <FormField align="end" style="display: flex;width: 100%">
            <Slider style="flex-grow: 1" bind:value={$output_rate} max={power_scale*1000000}/>
            <span slot="label" style="padding-right: 12px; width: max-content; display: block;">
                Energy output
            </span>
        </FormField>
    </div>
    <DataTable table$aria-label="Reactor Stat">
        <Head>
            <Row>
                <Cell>Stat</Cell>
                <Cell numeric>Value</Cell>
                <Cell></Cell>
                <Cell>Stat</Cell>
                <Cell numeric>Value</Cell>
            </Row>
        </Head>
        <Body>
        <Row>
            <Cell>Input rate</Cell>
            <Cell>{fmt_energy($input_rate)}</Cell>
            <Cell></Cell>
            <Cell>Output rate</Cell>
            <Cell>{fmt_energy($output_rate)}</Cell>
        </Row>
        <Row>
            <Cell>Energy consume rate</Cell>
            <Cell>{fmt_energy($consume_rate)}</Cell>
            <Cell></Cell>
            <Cell>Tick</Cell>
            <Cell>{$tick}</Cell>
        </Row>
        <Row>
            <Cell>Temperature</Cell>
            <Cell>{$temperature}</Cell>
            <Cell></Cell>
            <Cell>Generation</Cell>
            <Cell>{fmt_energy($generation_rate)}</Cell>
        </Row>
        <Row>
            <Cell>Shield</Cell>
            <Cell>{fmt_energy($shield)}/{fmt_energy($shield_max)}</Cell>
            <Cell></Cell>
            <Cell>Saturation</Cell>
            <Cell>{fmt_energy($saturation)}/{fmt_energy($saturation_max)}</Cell>
        </Row>
        <Row>
            <Cell>Fuel</Cell>
            <Cell>{ItemQuantity.from_fluid($fuel).toString()}</Cell>
            <Cell></Cell>
            <Cell>Consumed</Cell>
            <Cell>{$consumed.toFixed(5)}</Cell>
        </Row>
        <Row>
            <Cell>State</Cell>
            <Cell>{$state}</Cell>
            <Cell></Cell>
            <Cell>Fuel use rate</Cell>
            <Cell>{$fuel_use_rate}</Cell>
        </Row>
        </Body>
    </DataTable>
</Container>

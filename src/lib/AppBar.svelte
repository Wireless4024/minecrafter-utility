<script lang="ts">
    import {H6}                         from '@smui/common/elements'
    import Drawer, {
        AppContent,
        Content,
        Header,
        Scrim,
        Subtitle,
        Title,
    }                                   from '@smui/drawer'
    import IconButton                   from '@smui/icon-button'
    import List, {
        Separator,
        Subheader
    }                                   from '@smui/list'
    import type {TopAppBarComponentDev} from '@smui/top-app-bar'
    import TopAppBar, {
        AutoAdjust,
        Row,
        Section,
        Title as ATitle
    }                                   from '@smui/top-app-bar'
    import {push}                       from "svelte-spa-router"
    import {navigations}                from "../util/routes"
    import {title}                      from "../util/shared_state.js";
    import NavItem                      from "./NavItem.svelte";

    let topAppBar: TopAppBarComponentDev

    let open: boolean = false
</script>
<Drawer variant="modal" fixed={false} bind:open>
    <Header>
        <Title>Minecrafter Utility</Title>
        <Subtitle>
            by Wireless4024
        </Subtitle>
    </Header>
    <Content>
        <List>
            {#each Object.entries(navigations) as [group, navigation] }
                {#if group}
                    <Separator/>
                    <Subheader component={H6}>{group}</Subheader>
                {/if}
                {#each navigation as info}
                    <NavItem href={info.path}
                             icon={info.icon}
                             description={info.description}>
                        {info.name}
                    </NavItem>
                {/each}
            {/each}
        </List>
    </Content>
</Drawer>
<Scrim fixed={false}/>
<AppContent class="app-content">
    <TopAppBar bind:this={topAppBar} variant="standard">
        <Row>
            <Section>
                <IconButton class="material-icons" on:click={()=>open = true}>
                    menu
                </IconButton>
                <ATitle>{$title}</ATitle>
            </Section>
            <Section align="end" toolbar>
                <IconButton class="material-icons" title="go home" aria-label="back to home page"
                            on:click={()=>push('/')}>
                    home
                </IconButton>
            </Section>
        </Row>
    </TopAppBar>
    <AutoAdjust {topAppBar}>
        <slot></slot>
    </AutoAdjust>
</AppContent>
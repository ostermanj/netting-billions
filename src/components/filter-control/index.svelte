<script>
/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
//import dictionary from '@Project/data/dictionary.json';
import FilterItem from '@Project/components/filter-item/';
import { xOut as XOut } from '@Submodule/UI-Svelte/';
import { FilterIsClosed, OrganizeBy, HasFiltersApplied } from '@Project/store.js';
import { Sortable } from '@shopify/draggable';
import { onMount } from 'svelte';
import { isWorking } from '@Project/index.js';

let sections = ['rfmo','species','gear','product']; 
let selecteds = sections.map(() => []);
let orgBy = [];
$:hasFiltersSelected = (function(){
    if ( selecteds.some(d => d.length > 0) ){
        HasFiltersApplied.set(true);
    } else {
        HasFiltersApplied.set(orgBy.length > 0);
    }
})();
let filterIsClosing = true;
let filterIsClosed = true;
let draggableContainers = [];
FilterIsClosed.subscribe(v => {
    filterIsClosing = v;
    setTimeout(() => {
        filterIsClosed = v;
    }, v ? 250 : 0);
});

    
function closeHandler(){
    FilterIsClosed.set(true);
}

onMount(() => {
    var sortable = new Sortable(draggableContainers, {
        draggable: '.filter-item',
        distance: 5,
        handle: '*:not(.form-wrapper)'
    });

    sortable.on('sortable:stop', e => {
       if ( e.newContainer == draggableContainers[1] || ( e.newContainer == draggableContainers[0] && e.oldContainer == draggableContainers[1] )) {
            isWorking(true);
            setTimeout(() => {
                orgBy = Array.from(draggableContainers[1].children).map(d => d.dataset.key);
                if (orgBy.length < 2 ){
                    isWorking(false);
                }
                OrganizeBy.set(orgBy);
            });
        }
    });
}); 
</script>

<style lang="scss">
    @import '../../css/variables.scss';
    :global(#render-filter-here){
        position: sticky;
        top: 101px;
        z-index: 5;
    }
    .filter-container {
        left: 0;
        width: 100%;
        z-index: 5;
        transition: transform 0.25s ease-out;
        margin-top: -176px;
        @media screen and (max-width: 910px) {
            top: 98px;            
        }

    }
    .full-width-container {
        width: 100vw;
        position: relative;
        left: 50%;
        right: 50%;
        margin-left: -50vw;
        margin-right: -50vw;
        background-color: #fff;
        border-top: 1px solid $gray;
        border-bottom: 1px solid $gray;

    }
    form {
        position: relative;
        width: 100%;
        max-width: 990px;
        margin: 0 auto;
        display: flex;
        flex-wrap: wrap;
        align-items: stretch;
        padding: 80px 0 40px;
        @media screen and (max-width: 1020px) {
            padding: 80px 20px 40px;
        }
    }
    .form-section {
        flex-grow: 1;
        max-width: 420px;
        margin-right: 20px;
        display: flex;
        flex-direction: column;
    }
    .filter-items-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
    }
    .filter-items-container--organize {
        background-color: $light_gray;
        height: 230px;
        padding: 10px;
        position: relative;
        bottom: 10px;
    }
    .section-label {
        font-weight: bold;
        margin-bottom: 1.2rem;
    }
    .filterIsClosing {
        transform: translateX(101vw);
        transition-timing-function: ease-in;
    }
    .filterIsClosed {
        visibility: hidden;
    }
    .x-out-outer-wrapper {
        width: 100%;
        max-width: 850px;
        margin: 0 auto;
        position: relative;
        z-index: 1;
        top: 40px;
    }
    .x-out-container {
        position: absolute;
        top: 1px;
        right: 16px;
    }
    .inner-container {
        position: absolute;
        width: 100%;
        background-color: #fff;
        border-bottom: 1px solid $gray;
    }
</style>
<div on:click|stopPropagation="{() => {}}" id="nb-filter-container" class:filterIsClosing class:filterIsClosed class="filter-container" aria-hidden="{filterIsClosed || filterIsClosing }">
    <div class="full-width-container">
        <div class="inner-container">
            <div class="x-out-outer-wrapper">
                <div hidden="{filterIsClosed}" class="x-out-container" on:click|preventDefault="{closeHandler}">
                    <XOut ariaLabel="Close filter drill-down form" />
                </div>
            </div>
            <form id="filter-drill-down-form" aria-label="Set filters and drill-down into data">
                <section class="form-section" id="filter-form" aria-labelledby="filter-form-label">
                    <label class="section-label" id="filter-form-label">Available filters:</label>
                    <div bind:this="{draggableContainers[0]}" class="filter-items-container">
                       {#each sections as section, i }
                        <FilterItem {section} bind:selected="{selecteds[i]}"/>
                        {/each}
                    </div>
                </section>
                <section class="form-section" id="drill-down-form" aria-labelledby="drill-down-label">
                    <label class="section-label" id="drill-down-label">Organize by:</label>
                    <div bind:this="{draggableContainers[1]}" class="filter-items-container filter-items-container--organize">
                    </div>
                </section>
            </form>
        </div>
    </div>
</div>
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
let container = document.querySelector('#render-filter-here');
let selecteds = sections.map(() => []);
let orgBy = sections.slice(); // taking a copy
$:hasFiltersSelected = (function(){
    if ( selecteds.some(d => d.length > 0) ){
        HasFiltersApplied.set(true);
    } else {
        HasFiltersApplied.set(orgBy.length > 0);
    }
})();
let filterIsClosing = false;
let filterIsClosed = false;
let draggableContainer
FilterIsClosed.subscribe(v => {
    filterIsClosing = v;
    setTimeout(() => {
        filterIsClosed = v;
        container.classList[v ? 'add' : 'remove']('filterIsClosed');
    }, v ? 250 : 0);
});

    
function closeHandler(){
    FilterIsClosed.set(true);
}

onMount(() => {
    var sortable = new Sortable(draggableContainer, {
        draggable: '.filter-item',
        distance: 5,
        handle: '*:not(.form-wrapper)'
    });
    sortable.on('sortable:stop', e => {
        // if dragged to right container or dragged to left container from right container
        var _orgBy = Array.from(draggableContainer.children)
                .filter(node => !['draggable--original','draggable-mirror']
                    .some(className => node.classList.contains(className)))
                        .map(n => n.dataset.key);

        if (_orgBy.join() !== orgBy.join){ // is a new order
            isWorking(true);
            orgBy = _orgBy.slice(); // take a copy to avoid mutating later
            if (orgBy.length < 2 ){
                isWorking(false);
            }
            if ( window.requestIdleCallback ){
            // OrganizeBy.set(orgBy);
                requestIdleCallback(() => OrganizeBy.set(orgBy),{timeout: 500});
            } else {
                setTimeout(() => {
                    OrganizeBy.set(orgBy);
                });
            }

        }
    });
}); 
</script>

<style lang="scss">
    @import '../../css/variables.scss';
    :global(#render-filter-here){
        position: sticky;
        top: 76px;
        z-index: 5;
        @media screen and (max-width: 910px) {
            top: 73px;
        }
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
        top: 25px;
        position: relative;


    }
    form {
        position: relative;
        width: 100%;
        max-width: 650px;
        margin: 0 auto;
        padding: 22px 0 30px;
        max-height: calc(100vh - 120px);
        

        @media screen and (max-width: 1020px) {
            padding: 22px 20px 30px;
        }
        @media screen and (max-width: 579px) {
            overflow-y: auto;
        }
    }
    .form-section {
        flex-grow: 1;
        margin-right: 20px;
        display: flex;
        flex-direction: column;
        width: 100%;

    }
    .filter-items-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        background-color: $light_gray;
        height: 230px;
        padding: 10px;
        position: relative;
        bottom: 10px;
    }
    .filter-items-container--organize {
    }
    .section-label {
        font-weight: bold;
        margin-bottom: 1.2rem;
    }
    .filter-container.filterIsClosing {
        transform: translateX(101vw);
        transition-timing-function: ease-in;
    }
    .filter-container.filterIsClosed {
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
        top: -22px;
        right: 16px;
        @media screen and (max-width: 1020px) {
            right: 0;
        }
        @media screen and (max-width: 922px) {
            right: 18px;
        }
    }
    .inner-container {
        position: absolute;
        width: 100%;
        background-color: #fff;
        border-bottom: 1px solid $gray;
        box-shadow: 0 1px 4px rgba(0,0,0,0.5);
    }
    :global(#render-filter-here.filterIsClosed) {
        overflow-x: hidden;
        margin-bottom: -174px;
    }
    .org-by-label {
        position: relative;
        display: block;
        color: $dark_gray;
        padding: 8px 16px 8px 32px;
        line-height: 100%;
        white-space: nowrap;
        overflow-x: hidden;
    }
    input[type="checkbox"] {
        position: absolute;
        left: 11px;
        top: 10px;
        width: 12px;
        height: 12px;
        background-color: #fff;
        margin: 0;
        padding: 0;
        border: 1px solid $gray;
        -webkit-appearance: none;
        appearance:none;
    }
    input[type="checkbox"]:checked::after {
        top: -1px;
        left: -1px;
        position: absolute;
        width: 12px;
        height: 12px;
        border-radius: 2px;
        display: block;
        content: " ";
        font-size: .625rem;
        line-height: 1;
        background-color: $pew_blue;
        color: #fff;
        text-align: center;
        background: url("data:image/svg+xml,%3Csvg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 7.67 7.97'%3E%3Cpolyline points='0.35 5 2.55 7.19 7.26 0.28' style='fill:none;stroke:%23333;stroke-miterlimit:10'/%3E%3C/svg%3E") 50% 50% / 75% 75% no-repeat;
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
            <form id="filter-drill-down-form" aria-labelled-by="filter-form-label">
                <p class="filter-form-label" id="filter-form-label"><strong>Use the filters to select which data to include.<br />Drag and drop the categories to change how the data is organized.</strong></p>
                    
                    <div class="form-section" id="filter-form" aria-labelledby="filter-form-label">
                        <div bind:this="{draggableContainer}" class="filter-items-container">
                           {#each sections as section, i }
                            <FilterItem {section} bind:selected="{selecteds[i]}"/>
                            {/each}
                        </div>
                    </div>
            <label class="org-by-label"><input type="checkbox" /> Organize data as shown above</label>
            </form>
        </div>
    </div>
</div>
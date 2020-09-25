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
let clearAllHandlers = sections.reduce((acc,cur) => {acc[cur] = undefined; return acc},{})
let container = document.querySelector('#render-filter-here');
let selecteds = sections.map(() => []);
let orgBy = sections.slice(); // taking a copy
let hasBeenReorganized = false;
// orBy length is > 0 at page load so we need to trigger a hasBeenReorganized gate
$:reorgIsActive = orgBy.length > 0 && hasBeenReorganized == true;
$:filtersApplied = selecteds.some(d => d.length > 0); // only applies to filters, not reorg
$:hasFiltersSelected = (function(){ // despite name hasFiltersApplid is true if filters are applied or if reorg is on
    if ( filtersApplied ){
        HasFiltersApplied.set(true);
    } else {
        HasFiltersApplied.set(reorgIsActive);
    }
})();
let filterIsClosing = false;
let filterIsClosed = false;
let draggableContainer;

FilterIsClosed.subscribe(v => {
    filterIsClosing = v;
    setTimeout(() => {
        filterIsClosed = v;
        container.classList[v ? 'add' : 'remove']('filterIsClosed');
    }, v ? 250 : 0);
});
function clearAllFilters(){
   Object.values(clearAllHandlers).forEach(handler => handler());
}
function reorgChangeHandler(e){
    console.log(e,this, this.value);
    if (this.value == 'on' && !hasBeenReorganized) hasBeenReorganized = true;
    reorganize(e, this.value == 'off');
}
    
function closeHandler(){
    FilterIsClosed.set(true);
}

function reorganize(e, reset){
    var _orgBy = reset ? [] : Array.from(draggableContainer.children)
            .filter(node => !['draggable--original','draggable-mirror']
                .some(className => node.classList.contains(className)))
                    .map(n => n.dataset.key);

    if (_orgBy.join() !== orgBy.join){ // is a new order
        hasBeenReorganized = true;
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
}

onMount(() => {
    var sortable = new Sortable(draggableContainer, {
        draggable: '.filter-item',
        distance: 5,
        handle: '.filter-label'
    });
    sortable.on('sortable:stop', reorganize);
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
        max-width: 990px;
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
        position: relative;
        flex-grow: 1;
        margin-right: 20px;
        display: flex;
        background-color: $lightest_gray;
        width: 100%;
        padding: 37px 10px 0px;
    }
    .filter-items-container {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        background-color: $lightest_gray;
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
        right: 6px;
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
    .org-by-toggle {
        position: absolute;
        top: 7px;
        left: 28px;
        p {
            font-weight: bold;
        }
        p, label {
            line-height: 1;
            margin-right: 0.5em;
            display: inline-block;
        }
        label {
            position: relative;
            padding-left: 17px;
        }
        input {
            position: absolute;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            margin-right: 0.125em;
        }
    }
    input[type="checkbox"] {
        position: absolute;
        left: 0;
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
    .filters-text::before {
        content: '';
        display: inline-block;
        width: 28px;
        height: 19px;
        height: 1lh;
        background: transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 19 19'%3E %3Cline stroke='%23333' stroke-width='2' class='st0' x1='1' y1='2' x2='18' y2='2'/%3E %3Cpath stroke='%23333' stroke-width='3' class='st1' d='M9.5,18V6V18z'/%3E %3Cpath stroke='%23333' fill='%23333' class='st2' d='M16.5,5l-6.9,9l-6.9-9H16z'/%3E %3C/svg%3E") 50% 50%/18px no-repeat;
    }
    .drag-drop-text::before {
        content: '';
        display: inline-block;
        width: 28px;
        height: 23px;
        background: transparent url('./handle.svg') 2px / 25px no-repeat;
    }
    .filter-position-labels {
        display: flex;
        flex-direction: column;
        font-weight: bold;
        &.inactive {
            color: #999;
        }

        div {
            height: 50px;
            margin-bottom: 2px;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            p {
                margin: 0;
            }
        }
    }
    .form-inner-wrapper {
        max-width: 820px;
    }
    .clear-all-filters {
        appearance: none;
        margin: 0;
        padding: 0;
        border: none;
        bottom: none;
        color: $pew_blue;
        position: absolute;
        top: 7px;
        right: 49px;
        font-weight: bold;
        &:hover, &:focus {
            text-decoration: underline;
        }
        &[disabled]{
            color: #999;
            cursor: not-allowed;
            text-decoration: none !important;
        }
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
                <div class="form-inner-wrapper">
                    <p class="filter-form-label" id="filter-form-label"><strong class="filters-text">Filter</strong> to select which data to  include.<br /><strong class="drag-drop-text">Drag and drop</strong> the categories to select a specific view and change how the data is organized.</p>
                                    
                    <div class="form-section" id="filter-form" aria-labelledby="filter-form-label">
                        <div class:inactive="{!reorgIsActive}" class="filter-position-labels">
                            <div><p>View by:</p></div>
                            <div><p>Drill down by:</p></div>
                            <div><p>Then:</p></div>
                            <div><p>Then:</p></div>
                        </div>
                        <div class="org-by-toggle">
                            <p>Reorganize:</p><label><input on:change="{reorgChangeHandler}" checked="{reorgIsActive}" type="radio" name="reorganize" value="on">On</label><label><input on:change="{reorgChangeHandler}" checked="{!reorgIsActive}" type="radio" name="reorganize" value="off">Off</label>
                        </div>
                        <button on:click|preventDefault="{clearAllFilters}" disabled="{!filtersApplied ? 'disabled' : null}" role="button" class="clear-all-filters">Clear all</button>
                        <div bind:this="{draggableContainer}" class="filter-items-container">
                           {#each sections as section, i }
                            <FilterItem {section} bind:selected="{selecteds[i]}" bind:clearAll="{clearAllHandlers[section]}" />
                            {/each}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
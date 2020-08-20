<script>
/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import dictionary from '@Project/data/dictionary.json';
import SearchForm from '@Project/components/search-form/';
import { DimensionFilter } from '@Project/store.js';

export let section;

let selected = [];

$:hasFiltersApplied = selected.length > 0;

function clickHandler(e){
    DimensionFilter.set(section);
}

</script>
<style lang="scss">
    @import '../../css/variables.scss';
    .filter-item {
        position: relative;
        height: 50px;
        background: $pew_blue url('./handle.svg') left / 25px no-repeat;
        margin-bottom: 2px;
        padding: 0 0 0 25px;
        color: #fff;
        text-transform: uppercase;
        font-weight: bold;
        font-size: 1.2rem;
        display: flex;
        justify-content: space-between;
        align-items: center;

    }
    .filter-label {
        flex-grow: 1;
    }
    .open-filter {
        appearance:none;
        border: none;

        padding: 0;
        margin: 0 12px 0 0;
        width: 28px;
        height: 28px;
        background: transparent url('./filter.svg') 50% 50% / 18px no-repeat;
        filter: brightness(6);
        transition: filter 0.2s ease-in-out;
        &:hover, &:focus {
            filter: brightness(1);
        }
    }
    .token-wrapper {
        //position: absolute;
        //top: 4px;
        //right: 35px;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
        line-height: 0;
        margin-right: 5px;
        &.hasFiltersApplied {
            opacity: 1;
        }
    }
    .filter-count {
        -webkit-appearance: none;
        border: none;
        padding: 2px 4px;
        border-radius: 3px;
        margin: 0;
        background-color: #fff;
        color: $pew_blue;
        font-weight: bold;
        font-size: 0.75rem;
    }
</style>
<div data-key="{section}" class="filter-item">
    <span class="filter-label">{dictionary[section].display}</span>
    <div class:hasFiltersApplied class="token-wrapper">
        <button role="button" disabled="{!hasFiltersApplied}" tabindex="{hasFiltersApplied ? 0 : -1}" title="See selected filters" on:click|preventDefault="{clickHandler}" class="filter-count">{selected.length}</button>
    </div>
    <button class="open-filter" on:click|preventDefault="{clickHandler}" role="button" aria-label="Filter {dictionary[section].display} options"></button>
    <SearchForm {section} bind:selected />
</div>
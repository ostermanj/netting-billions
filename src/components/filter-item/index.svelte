<script>
/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import dictionary from '@Project/data/dictionary.json';
import SearchForm from '@Project/components/search-form/';
import { DimensionFilter } from '@Project/store.js';

export let section;

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
    button {
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
</style>
<div data-key="{section}" class="filter-item">
    <span>{dictionary[section].display}</span><button on:click|preventDefault="{clickHandler}" role="button" aria-label="Filter {dictionary[section].display} options"></button>
    <SearchForm {section} />
</div>
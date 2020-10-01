<script>
    /* eslint no-unused-vars: warn */
    /* eslint no-undef: warn */
    import { FilterIsClosed, HasFiltersApplied } from '@Project/store.js';
    import { get } from 'svelte/store';
    let hasFiltersApplied = false;
    function toggleFilters(){
        var filterIsClosed = get(FilterIsClosed);
        FilterIsClosed.set(!filterIsClosed);
    }
    HasFiltersApplied.subscribe(v => {
        hasFiltersApplied = v;
    });
</script>
<style lang="scss">
    @import '../../css/variables.scss';
    button {
        appearance:none;
        border: none;
        position: relative;
        padding: 0;
        margin: 0 0 0 30px;
        width: 50px;
        height: 50px;
        top: 20px;
        left: 1.125rem;
        background: rgba(255,255,255,0.85) url('./filter.svg') 50% 5px / 24px no-repeat;
        overflow: visible;
        @media screen and (max-width: 470px) {
            left: 1.5rem;
        }
        &::before, &::after {
            position: absolute;
            left: 50%;
            transform: translateX(-50%);
            font-size: 10px;
            color: $dark_gray;
            font-weight: bold;
            text-transform: uppercase;
        }
        &::before {
            content: 'filters';
            bottom: 5px;
        }
        &:hover, &:focus, &.hasFiltersApplied {
            background-image: url('./filter-blue.svg');
            &::before, &::after {
                color: $pew_blue;
            }
        }
        &.hasFiltersApplied {
            &::after {
                content: 'applied';
                bottom:-6px;
            }
        }
    }
</style>
<button class:hasFiltersApplied role="button" aria-controls="nb-filter-container" on:click|stopPropagation="{toggleFilters}"></button>
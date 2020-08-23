<script>
    /* eslint no-unused-vars: warn */
    /* eslint no-undef: warn */
    import { FilterIsClosed, HasFiltersApplied } from '@Project/store.js';
    let hasFiltersApplied = false;
    function openFilters(){
        FilterIsClosed.set(false);
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

        padding: 0;
        margin: 0 0 0 30px;
        width: 28px;
        height: 28px;
        background: transparent url('./filter.svg') 50% 50% / 24px no-repeat;
        filter: brightness(0.3);
        transition: filter 0.2s ease-in-out;
        &:hover, &:focus {
            filter: brightness(1);
        }
        &.hasFiltersApplied {
            filter: brightness(1);
            &::before {
                content: 'filtered';
                position: absolute;
                left: 50%;
                bottom: -9px;
                transform: translateX(-50%);
                font-size: 10px;
                color: $pew_blue;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: -0.4px;
            }
        }
    }
</style>
<button class:hasFiltersApplied role="button" aria-controls="nb-filter-container" on:click|stopPropagation="{openFilters}"></button>
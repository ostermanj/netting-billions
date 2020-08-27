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
        position: relative;
        background-color: rgba(255,255,255,0.85);
        padding: 0;
        margin: 0 0 0 30px;
        width: 50px;
        height: 50px;
        top: 20px;
        &::after {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: transparent url('./filter.svg') 50% 5px / 24px no-repeat;
            filter: brightness(0.3);
            transition: filter 0.2s ease-in-out;
        }
        &:hover, &:focus {
            &::after {
                filter: brightness(1);
            }
        }
        &.hasFiltersApplied {
            &::after {
                filter: brightness(1);
            }
            &::before {
                content: 'filtered';
                position: absolute;
                left: 50%;
                bottom:5px;
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
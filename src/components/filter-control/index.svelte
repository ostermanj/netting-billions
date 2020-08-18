<script>
/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
//import dictionary from '@Project/data/dictionary.json';
import FilterItem from '@Project/components/filter-item/'

export let sections;

</script>
<style lang="scss">
    @import '../../css/variables.scss';
    .filter-container {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        z-index: 1;
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
        width: 100%;
        max-width: 990px;
        margin: 0 auto;
        display: flex;
        flex-wrap: wrap;
        align-items: stretch;
        padding: 2.5rem 0; 
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
        justify-content: space-around;
        justify-content: space-evenly;
        flex-grow: 1;
    }
    .filter-items-container--organize {
        background-color: $light_gray;
        height: 210px;
    }
    .section-label {
        font-weight: bold;
        margin-bottom: 1.2rem;
    }
</style>
<div class="filter-container">
    <div class="full-width-container">
        <form id="filter-drill-down-form" aria-label="Set filters and drill-down into data">
            <section class="form-section" id="filter-form" aria-labelledby="filter-form-label">
                <label class="section-label" id="filter-form-label">Available filters:</label>
                <div class="filter-items-container">
                   {#each sections as section }
                    <FilterItem {section} />
                    {/each}
                </div>
            </section>
            <section class="form-section" id="drill-down-form" aria-labelledby="drill-down-label">
                <label class="section-label" id="drill-down-label">Organize by:</label>
                <div class="filter-items-container filter-items-container--organize">
                </div>
            </section>
        </form>
    </div>
</div>
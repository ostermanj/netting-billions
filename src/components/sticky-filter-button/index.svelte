<script>
    import FilterButton from '@Project/components/filter-button/';
</script>
<style lang="scss">
    .sticky-btn-container {
        display: flex;
        justify-content: flex-end;
        position: sticky;
        top: 81px;
        margin-top: -56px;
        margin-bottom: 0;
        height: 0;
        z-index: 4;
        @media screen and (max-width: 910px) {
            top: 78px;
        }
        
    }
</style>

<div class="sticky-btn-container">
    <FilterButton />
</div>

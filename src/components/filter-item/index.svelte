<script>
/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import dictionary from '@Project/data/dictionary.json';

export let section;

</script>
<style lang="scss">
    @import '../../css/variables.scss';
    .filter-item {
        height: 50px;
        background-color: $pew_blue;
    }
</style>
<div class="filter-item">
    {section}
</div>
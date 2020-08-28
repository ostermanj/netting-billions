<script>
/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import dictionary from '@Project/data/dictionary.json';
import FilterButton from '@Project/components/filter-button/';
import { FilterIsClosed, HasFiltersApplied } from '@Project/store.js';

let sections = ['rfmo','species','gear','product'];
let anchors = {};
let filterIsClosed;
let selecteds = sections.map(() => []);
$: hasFiltersApplied = (function(){
    var bool = selecteds.reduce((acc,cur) => acc + cur.length, 0) > 0;
    HasFiltersApplied.set(bool);
    return bool;
}());
function clickHandler(){
  anchors[this.dataset.key] = anchors[this.dataset.key] || document.querySelector(`#head-${this.dataset.key}`);
  anchors[this.dataset.key].scrollIntoView(true);
} 
function bodyClickFn(){
    FilterIsClosed.set(true);
}
FilterIsClosed.subscribe(v => {
    filterIsClosed = v;
    if ( !filterIsClosed ){
        document.body.addEventListener('click', bodyClickFn);
    } else {
        document.body.removeEventListener('click', bodyClickFn);
    }
});
</script>
<style lang="scss">
    @import '../../css/variables.scss';
    .nav-wrapper {
        display: flex;
        align-items: center;
        margin-bottom: 96px;
        padding-right: 25px;
        margin-right: 25px;
        background-color: #fff;
    }
    nav {
        margin: 0;
        padding: 0;
        flex-grow: 1;
    }
    ul {
        margin: 0;
        padding: 0;
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        @media screen and (max-width: 585px){
            flex-direction: column;
        }
    }
    li {
        list-style: none;
        margin: 0;
        font-size: 2rem;
        font-size: clamp(1.5rem, 3.8vw, 2rem);
        font-weight: bold;
        padding: 0 0.625rem;

    }
    a {
        color: #333;
        transition: color 0.2s ease-in-out;
        text-transform: uppercase;
        &:active, &:visited {
            color: #333;
        }
        &:hover {
            color: $pew_blue;
        }
    }
    .isHidden {
        visibility: hidden;
    }
</style>
<div class="nav-wrapper">
    <nav class:isHidden="{!filterIsClosed}" aria-label="Navigation for data visualization section">
        <ul>
            {#each sections as section}
            <li><a data-key="{section}" on:click|preventDefault="{clickHandler}" href="#">{dictionary[section].display}</a></li>
            {/each}
        </ul>
    </nav>
</div>
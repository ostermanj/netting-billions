<script>
/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import dictionary from '@Project/data/dictionary.json';
import FilterControl from '@Project/components/filter-control/';
import { FilterIsClosed } from '@Project/store.js';

let sections = ['rfmo','species','gear','product']; 
let anchors = {};
let filterIsClosed;
function clickHandler(){
  anchors[this.dataset.key] = anchors[this.dataset.key] || document.querySelector(`#head-${this.dataset.key}`);
  anchors[this.dataset.key].scrollIntoView(true);
} 
function openFilters(){
    FilterIsClosed.set(false);
}
FilterIsClosed.subscribe(v => {
    filterIsClosed = v;
});
</script>
<style lang="scss">
    @import '../../css/variables.scss';
    .nav-wrapper {
        display: flex;
        align-items: center;
        margin-bottom: 6rem;
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
    }
    .isHidden {
        visibility: hidden;
    }
</style>
<div  class="nav-wrapper">
    <nav class:isHidden="{!filterIsClosed}" aria-label="Navigation for data visualization section">
        <ul>
            {#each sections as section}
            <li><a data-key="{section}" on:click|preventDefault="{clickHandler}" href="#">{dictionary[section].display}</a></li>
            {/each}
        </ul>
    </nav>
    <button role="button" aria-controls="nb-filter-container" on:click="{openFilters}"></button>
   <FilterControl {sections} />
</div>
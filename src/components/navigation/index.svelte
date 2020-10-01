<script>
/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import dictionary from '@Project/data/dictionary.json';
import FilterButton from '@Project/components/filter-button/';
import { FilterIsClosed, HasFiltersApplied, OrganizeBy } from '@Project/store.js';

let sections = ['rfmo','species','gear','product'];
let anchors = {};
let activeSection;

function clickHandler(){
  anchors[this.dataset.key] = anchors[this.dataset.key] || document.querySelector(`#head-${this.dataset.key}`);
  anchors[this.dataset.key].scrollIntoView(true);
} 
function bodyClickFn(){
    FilterIsClosed.set(true);
}
OrganizeBy.subscribe(v => {
    if ( v && v.length > 0 ){
        activeSection = v[0];
    } else {
        activeSection = undefined;
    }
    console.log(activeSection);
});
FilterIsClosed.subscribe(v => {
    if ( !v ){
        document.body.addEventListener('click', bodyClickFn);
    } else {
        document.body.removeEventListener('click', bodyClickFn);
    }
});
</script>
<style lang="scss">
    @import '../../css/variables.scss';
    .nav-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        padding-right: 25px;
        margin-right: 25px;
        background-color: #fff;
        @media screen and (max-width: 585px) {
            &::before {
                position: absolute;
                top: -1.2rem;
                left: .625rem;
                content: 'Jump to section:';
                color: $a11y;
                font-style: italic;
            }
        }
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
        &[disabled] {
            color: $a11y !important;
            cursor: not-allowed;
            text-decoration: none !important;
        }
        &.active {
           // color: $pew_blue;
            text-decoration: underline;
        }
    }
    .isHidden {
        visibility: hidden;
    }
</style>
<div class="nav-wrapper">
    <nav aria-label="Navigation for data visualization section">
        <ul>
            {#each sections as section}
            <li><a class:active="{activeSection && activeSection === section}" disabled="{activeSection && activeSection !== section ? 'disabled' : null}" title="{activeSection && activeSection !== section ? 'Filters applied: view not available' : null}" data-key="{section}" on:click|preventDefault="{clickHandler}" href="#">{dictionary[section].display}</a></li>
            {/each}
        </ul>
    </nav>
</div>
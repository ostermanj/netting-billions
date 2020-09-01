/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
/* global BUILDTYPE */
import './css/styles.scss';
import 'tippy.js/dist/tippy.css';
//import { fieldValues, returnNestedData } from './scripts/data.js';
import Navigation from '@Project/components/navigation/';
import StickyFilterButton from '@Project/components/sticky-filter-button/';
import FilterControl from '@Project/components/filter-control/';
import { initCharts } from '@Project/components/charts/';
import { HasFiltersApplied } from '@Project/store.js';


const navContainer = document.querySelector('#render-nav-here');
const filterContainer = document.querySelector('#render-filter-here');
const appContainer = document.querySelector('#render-here');

function disableHoverOnTouch(){
// HT: https://stackoverflow.com/a/30303898
    var hasHoverClass = false;
    var container = document.body;
    var lastTouchTime = 0;

    function enableHover() {
        // filter emulated events coming from touch events
        if (new Date() - lastTouchTime < 500) return;
        if (hasHoverClass) return;

        container.classList.add('has-hover');
        hasHoverClass = true;
    }

    function disableHover() {
        if (!hasHoverClass) return;
        container.classList.remove('has-hover');
        hasHoverClass = false;
    }

    function updateLastTouchTime() {
        lastTouchTime = new Date();
    }

    document.addEventListener('touchstart', updateLastTouchTime, true);
    document.addEventListener('touchstart', disableHover, true);
    document.addEventListener('mousemove', enableHover, true);

    enableHover();
}
disableHoverOnTouch();
HasFiltersApplied.subscribe(v => {
      appContainer.classList[v ? 'add' : 'remove']('has-filters-applied');
});
new Navigation({
  target: navContainer,
    hydrate: !( BUILDTYPE == 'development' || window.IS_PRERENDERING )
});
new FilterControl({
  target: filterContainer,
    hydrate: !( BUILDTYPE == 'development' || window.IS_PRERENDERING )
});
new StickyFilterButton({
  target: appContainer,
   hydrate: !( BUILDTYPE == 'development' || window.IS_PRERENDERING )
});
initCharts({});
//initCharts({filters: [], sortDirection: 'desc', sortBy: 'dv'});
//initCharts({filters: [['rfmo','W']]});
document.dispatchEvent(new Event('custom-render-trigger'));

export function isWorking(bool){
    if ( bool ){
        appContainer.classList.add('is-working');
       // appContainer.classList.add('is-working--transition');
    } else {
      //  appContainer.classList.remove('is-working--transition');
       // setTimeout(() => {
            appContainer.classList.remove('is-working');
       // },200);
    }
    
}
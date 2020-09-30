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
import { disableHoverOnTouch } from '@Submodule/UTILS';
import { HasFiltersApplied } from '@Project/store.js';


const navContainer = document.querySelector('#render-nav-here');
const filterContainer = document.querySelector('#render-filter-here');
const appContainer = document.querySelector('#render-here');

export default function init(){
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
  if (window.IS_PRERENDERING){
    document.dispatchEvent(new Event('custom-render-trigger'));
  }
}

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
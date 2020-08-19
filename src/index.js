/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
/* global BUILDTYPE */
import './css/styles.scss';
//import { fieldValues, returnNestedData } from './scripts/data.js';
import Navigation from '@Project/components/navigation/';
import { initCharts } from '@Project/components/charts/';
import { OrganizeBy } from '@Project/store.js';

const appContainer = document.querySelector('#render-here');

if ( module.hot ){
    module.hot.accept('@Project/components/navigation/index.svelte');
}
new Navigation({
    target: document.querySelector('#render-here'),
   // hydrate: !( BUILDTYPE == 'development' || window.IS_PRERENDERING )
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
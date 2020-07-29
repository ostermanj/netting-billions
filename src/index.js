/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
//import "core-js/stable";
//import "regenerator-runtime/runtime";
import './css/styles.scss';
import { fieldValues, nestedData } from './scripts/data.js';
import { initCharts } from '@Project/components/charts/';

initCharts({fieldValues,nestedData});
document.dispatchEvent(new Event('custom-render-trigger'));
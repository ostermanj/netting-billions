/* global PUBLICPATH */
/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */

import Papa from 'papaparse';
import { initData } from '@Project/scripts/data.js';
import init from './app.js';
import dataFile from './data/data.csv'; // via file-loader

const publicPath = window.IS_PRERENDERING ? '' : PUBLICPATH;

Papa.parse(publicPath + dataFile, {
    complete: function(results) {
        initData(results.data); // passes data to data.js where it's processed. app.js gets in from there after it's called
        init();
    },
    download: true,
    dynamicTyping: true,
    error: function(error, file) {
        console.log(error,file);
    },
    header: true,
    skipEmptyLines: true
});
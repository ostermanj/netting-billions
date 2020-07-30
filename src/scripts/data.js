/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import data from '@Project/data/data.csv';
import d3 from '@Project/d3-importer.js';

/*  1. create an object with all fields from the data except `value` as keys and a Set of all values for that field as the values.
    This will be used later to set up <table>s that will house the svg graphs. The data will be nested so that the summaries of the
    data make sense at each level of nesting (i.e., nested first by property being measured). That's good for the data but will not mirror the 
    order in which the DOM elements will be constructed.

    eg {
        gear: Set(7),
        rfmo: Set(7),
        product: Set(5),
        species: Set(7),
        year: Set(4)
    }
 */
const fieldValues = data.reduce((acc, cur) => {
    Object.keys(cur).forEach(key => {
        if (key !== 'value') {
            acc[key] = !acc[key] ? new Set([cur[key]]) : acc[key].add(cur[key]);
        }
    });
    return acc;
}, {});



/******************/

/*  2. Nest the data in an order that makes sense for the data, i.e. by the `property` field first so that the summaries done in
    #3 below and combining only like values. Doesn't make sense, for instance, to total up all values in WCPO ocean basin, for
    instance, if those values will included tonnage and dollar amounts.
*/

function nestBy(fields, data) {
    return fields.reduce(function(acc, cur) {
        return acc.key(d => d[cur]);
    }, d3.nest()).rollup(leaves => d3.sum(leaves, l => l.value)).entries(data);
}

// assigning nestedValues as children of a total datum so that the rollup summaries of all
// data can be properties of it. this way we can access the min/max percentage change, and other 
// relative measures of change like z-score, deviation, etc, for the entire data set and scale
// all graphs consistently

const nestedData = summarizeChildren({
    key: 'total',
    values: ['rfmo', 'species', 'gear', 'product'].map(d => {
        var nested = nestBy([undefined, 'property', d, 'year'], data);
        nested.forEach(datum => { // mutates nested
            datum.key = d;
        });
        return nested[0];
    })
});


/***********************/

/*  3. Summarize the nestedData at each level. This will facilitate easy reference to max and min values, for instance, at 
    all levels of aggregation so that graphs can more easily be put on different scales. Should also facilitate normalizing values
    if needed and other manipulations.
*/

function summarizeChildren(datum) {
    function _summarize(datum) {
        var descendantValues = datum.values.reduce((acc, cur) => {
            cur.parent = datum;
            return acc.concat(cur.values ? _summarize(cur) : cur.value);
        }, []);
        var pValues = returnPValues(datum);

        function returnPValues(datum) {
            return datum.values.reduce((acc, cur) => {
                var min = d3.min([acc[0], cur.values ? returnPValues(cur)[0] : (cur.value - datum.values[0].value) / datum.values[0].value]);
                var max = d3.max([acc[1], cur.values ? returnPValues(cur)[1] : (cur.value - datum.values[0].value) / datum.values[0].value]);
                return [min, max];
            }, [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
        }
        datum.descendantValues = descendantValues;
        datum.max = d3.max(descendantValues);
        datum.min = d3.min(descendantValues);
        datum.mean = d3.mean(descendantValues);
        datum.median = d3.median(descendantValues);
        datum.variance = d3.variance(descendantValues);
        datum.deviation = d3.deviation(descendantValues);
        datum.maxZ = d3.max(descendantValues, d => (d - datum.mean) / datum.deviation); // z-score
        datum.minZ = d3.min(descendantValues, d => (d - datum.mean) / datum.deviation); // z-score 
        datum.minP = pValues[0]; // percentage values. min/max value as expressed as a percentage of the first data point (year 0).
        datum.maxP = pValues[1]; // percentage values. min/max value as expressed as a percentage of the first data point (year 0).

        return descendantValues;

    }
    _summarize(datum);
    return datum;
}

export { fieldValues, nestedData} ;
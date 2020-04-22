import './css/styles.scss';
import d3 from './d3-importer.js';
import data from './data/data.csv';

/*  1. create an object with all fields from the data except `value` as keys and a Set of all values for that field as the values.
    This will be used later to set up <table>s that will house the svg graphs. The data will be nested so that the summaries of the
    data make sense at each level of nesting (i.e., nested first by property being measured). That's good for the data but will not mirror the 
    order in which the DOM elements will be constructed.
 */
    const fieldValues = data.reduce((acc, cur) => {
        Object.keys(cur).forEach(key => {
            if ( key !== 'value' ){
                acc[key] = !acc[key] ? new Set([cur[key]]) : acc[key].add(cur[key]);
            }
        });
        return acc;
    },{});
    console.log(fieldValues);
/*  2. Nest the data in an order that makes sense for the data, i.e. by the `property` field first so that the summaries done in
    #3 below and combining only like values. Doesn't make sense, for instance, to total up all values in WCPO ocean basin, for
    instance, if those values will included tonnage and dollar amounts.
*/

    function nestBy(fields,data){
        return fields.reduce(function(acc,cur){
            return acc.key(d => d[cur]);
        },d3.nest()).entries(data);
    }

    const nestedData = nestBy(['property','ocean','year'], data);

/*  3. Summarize the nestedData at each level. This will facilitate easy reference to max and min values, for instance, at 
    all levels of aggregation so that graphs can more easily be put on different scales. Should also facilitate normalizing values
    if needed and other manipulations.
*/

    function summarizeChildren(datum){ 
        var descendantValues = datum.values.reduce((acc, cur) => {
            return acc.concat(cur.values ? summarizeChildren(cur) : cur.value);
        },[]);
        
        datum.valueCount = [descendantValues.length, d3.format(',.0f')(descendantValues.length)];
        datum.max = [d3.max(descendantValues), d3.format(',.0f')(d3.max(descendantValues))];
        datum.min = [d3.min(descendantValues), d3.format(',.0f')(d3.min(descendantValues))];
        datum.total = [d3.sum(descendantValues), d3.format(',.0f')(d3.sum(descendantValues))];
        datum.mean = [d3.mean(descendantValues), d3.format(',.0f')(d3.mean(descendantValues))];
        datum.median = [d3.median(descendantValues), d3.format(',.0f')(d3.median(descendantValues))];
        datum.variance = [d3.variance(descendantValues), d3.format(',.0f')(d3.variance(descendantValues))];
        datum.deviation = [d3.deviation(descendantValues), d3.format(',.0f')(d3.deviation(descendantValues))];

        return descendantValues;
    }
    nestedData.forEach(datum => {
        summarizeChildren(datum);
    });

    console.log(nestedData);
/* end */

/*
const margin = {
    top: 1,
    right: 0,
    bottom: 1,
    left: 0
};

const years = [2012,2014,2016,2018];

const viewBoxHeight = 50;

const height = viewBoxHeight - margin.top - margin.bottom;
const width = 100 - margin.left - margin.right;

const yScaleLog = d3.scaleLog().range([height, 0]);  // to be completed each instance
const yScaleLinear = d3.scaleLinear().range([height, 0]);  // to be completed each instance
const xScale = d3.scaleLinear().range([0, width]).domain([years[0], years[years.length - 1]]);

/*const minMax = ['volume','catch_value','sales_value'].reduce(function(acc,cur){
    console.log(data.filter(d => d.property == cur));
    acc[cur] = [d3.min(data.filter(d => d.property == cur), d => d.value), d3.max(data.filter(d => d.property == cur), d => d.value)];
    return acc;
},{});*/
/*
d3.formatLocale({
    decimal: '.',
    thousands: ',',
    grouping: [3],
    currency: ['$', '']
});

function returnValueline(property, {scale, sharedScale}) {
    return d3.line()
        .x(d => {
            return xScale(d.x);
        })
        .y(d => {
            if ( sharedScale ){
                return scale.domain( [d3.min(sums[property]), d3.max(sums[property])] )(d.y);
            } else {
                return scale.domain( [d.min, d.max ] )(d.y);
            }
        });
}




console.log(nestedData);
/*function summarizeChildren(datum){ // ie {key: 'WPCO', values: []}}
   function total(datum){
        datum.total = datum.values.reduce((acc, cur) => {
            return acc + (cur.values ? total(cur) : cur.value);
        },0);
        return datum.total;
   }
   function descendants(datum){ // 
    console.log(datum);
        datum.descendants = datum.values.reduce((acc, cur) => {
            //console.log(cur);
            return acc + (cur.values ? descendants(cur) : 1);
        },0);
        datum.mean = datum.total / datum.descendants;
        return datum.descendants;
   }
   function minMax(datum){
      datum.minMax = datum.values.reduce((acc,cur) => {
        acc[0] = cur.values ? Math.min(minMax(cur)[0], acc[0]) : Math.min(cur.value, acc[0]);
        acc[1] = cur.values ? Math.max(minMax(cur)[1], acc[1]) : Math.max(cur.value, acc[1]);
        return acc;
      },[Number.POSITIVE_INFINITY,Number.NEGATIVE_INFINITY]);
      return datum.minMax;
   }
   function descendantValues(datum){
        datum.descendantValues = datum.values.reduce((acc, cur) => {
            return acc.concat(cur.values ? descendantValues(cur) : cur.value);
        },[]);
        return datum.descendantValues;
   }
   total(datum);
   descendants(datum);
   minMax(datum);
   descendantValues(datum);
}   
*/
/*

function renderTable(scale,index){
    var rows = d3.select('#d3-container-' + index)
        .selectAll('tr').data(nestedData)
        .enter().append('tr')
        .attr('class', d => d.key);

    rows
        .append('th')
        .text( d => d.key); 

    rows
        .selectAll('td').data(d => d.values)
        .enter().append('td')
        .each(function(d){
            var _svgs = d3.select(this)
                .append('svg')
                .attr('viewBox', '0 0 100 ' + viewBoxHeight)
                .attr('focusable', false)
                .attr('xmlns', 'http://www.w3.org/2000/svg')
                .attr('version', '1.1');
            
            _svgs.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`)
                .append('path')
                .datum( d => years.map(year => {
                    return {
                        x: year,
                        y: d.values.find(d => d.key == year).value,
                        min: d3.min(d.values, v => v.value),
                        max: d3.max(d.values, v => v.value)
                    };
                }))
                .attr('d', returnValueline(d.key, scale))
                .attr('class', 'sparkline');
        })


}

[
    {scale: yScaleLinear, sharedScale: false},
    {scale: yScaleLinear, sharedScale: true},
    {scale: yScaleLog, sharedScale: false},
    {scale: yScaleLog, sharedScale: true},

].forEach((scale,i) => {
    renderTable(scale,i);
});*/
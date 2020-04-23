import './css/styles.scss';
import d3 from './d3-importer.js';
import data from './data/data.csv';

window.data = data;
window.d3 = d3;

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
        
        datum.valueCount = descendantValues.length;
        datum.max    = d3.max(datum.values, v => v.total || v.value);
       // datum.max = d3.max(desce);
        datum.min = d3.min(datum.values, v => v.total || v.value);
        datum.total = d3.sum(descendantValues);
        datum.mean = d3.mean(descendantValues);
        datum.median = d3.median(descendantValues);
        datum.variance = d3.variance(descendantValues);
        datum.deviation = d3.deviation(descendantValues);

        return descendantValues;
    }
    nestedData.forEach(datum => {
        summarizeChildren(datum);
    });

    console.log(nestedData);
/* end */

/*

const years = fieldValues.year.values().sort();


const height = viewBoxHeight - margin.top - margin.bottom;
const width = 100 - margin.left - margin.right;

//const yScaleLog = d3.scaleLog().range([height, 0]);  // to be completed each instance



d3.formatLocale({
    decimal: '.',
    thousands: ',',
    grouping: [3],
    currency: ['$', '']
});

function returnValueline(property) {
    return d3.line()
        .x(d => {
            return xScale(d.x);
        })
        .y(d => {
            return yScale(d.y);
        });
}
*/
const years = Array.from(fieldValues.year.values()).sort();
const margin = {
    top: 1,
    right: 0,
    bottom: 1,
    left: 0
};
const viewBoxHeight = 50;
const height = viewBoxHeight - margin.top - margin.bottom;
const width = 100 - margin.left - margin.right;
const yScale = d3.scaleLinear().range([height, 0]);  // to be completed each instance
const xScale = d3.scaleLinear().range([0, width]).domain([years[0], years[years.length - 1]]);


const valueline = d3.line()
    .x(d => {
        return xScale(d.x);
    })
    .y(d => {
        return yScale(d.y);
    });
// TO DO . UGH HERE there is a problem with the min max
function createSVG({datum,parent}){
    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    console.log(parent, d3.min(parent.values, v => v.total), d3.max(parent.values, v => v.total));
    /* put each graph on its own scale filling full range */
    // yScale.domain([datum.min, datum.max]); 
    /* put each column of charts on its own scale. ie each property on same scale, comparable */
    yScale.domain([d3.min(parent.values, v => v.min), d3.max(parent.values, v => v.max)]);
    d3.select(svg)
        .attr('viewBox', '0 0 100 ' + viewBoxHeight)
        .attr('focusable', false)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('version', '1.1')
        .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)
            .append('path')
            .datum( () => {
                var _d = years.map(year => {
                    return {
                        x: year,
                        y: datum.values.find(d => d.key == year).total,
                    };
                });
                console.log(_d);
                return _d;
            })
            .attr('d', valueline)
            .attr('class', 'sparkline');
    document.body.appendChild(svg);
    return svg;

}
const SVGs = nestedData.reduce((acc,property) => {
    acc[property.key] = property.values.reduce((acc, ocean) => {
        acc[ocean.key] = createSVG({datum: ocean, parent: property});
        return acc;
    },{});
    return acc;
},{});

console.log(SVGs);
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
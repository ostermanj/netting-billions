/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import './css/styles.scss';
import d3 from './d3-importer.js';
import data from './data/data.csv';
import StringHelpers from '@Submodule/UTILS';

window.data = data;
window.d3 = d3;

/*******************/

/*  1. create an object with all fields from the data except `value` as keys and a Set of all values for that field as the values.
    This will be used later to set up <table>s that will house the svg graphs. The data will be nested so that the summaries of the
    data make sense at each level of nesting (i.e., nested first by property being measured). That's good for the data but will not mirror the 
    order in which the DOM elements will be constructed.

    eg {
        gear: Set(7),
        ocean: Set(7),
        product: Set(5),
        species: Set(7),
        year: Set(4)
    }
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



/******************/

/*  2. Nest the data in an order that makes sense for the data, i.e. by the `property` field first so that the summaries done in
    #3 below and combining only like values. Doesn't make sense, for instance, to total up all values in WCPO ocean basin, for
    instance, if those values will included tonnage and dollar amounts.
*/

    function nestBy(fields,data){
        return fields.reduce(function(acc,cur){
            return acc.key(d => d[cur]);
        },d3.nest()).rollup(leaves => d3.sum(leaves, l => l.value)).entries(data);
    }

    //const nestedData = nestBy(['property','ocean','year'], data);
    const nestedData = ['ocean','species','gear','product'].map(d => {
        var nested = nestBy([ undefined, 'property', d, 'year'], data);
        nested.forEach(datum => { // mutates nested
            datum.key = d;
            summarizeChildren(datum);
        });
        return nested[0];
    });

    console.log('nested',nestedData);
        




/***********************/

/*  3. Summarize the nestedData at each level. This will facilitate easy reference to max and min values, for instance, at 
    all levels of aggregation so that graphs can more easily be put on different scales. Should also facilitate normalizing values
    if needed and other manipulations.
*/

    function summarizeChildren(datum){ 
        var descendantValues = datum.values.reduce((acc, cur) => {
            cur.parent = datum;
            return acc.concat(cur.values ? summarizeChildren(cur) : cur.value);
        },[]);
        var pValues = returnPValues(datum);
        function returnPValues(datum){
            return datum.values.reduce((acc, cur) => {
                var min = d3.min([acc[0], cur.values ? returnPValues(cur)[0] : ( cur.value - datum.values[0].value ) / datum.values[0].value ]);
                var max = d3.max([acc[1], cur.values ? returnPValues(cur)[1] : ( cur.value - datum.values[0].value ) / datum.values[0].value ]);
                return [min,max];
            },[Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]);
        }
        datum.descendantValues = descendantValues;
        datum.max       = d3.max(descendantValues);
        datum.min       = d3.min(descendantValues);
        datum.mean      = d3.mean(descendantValues);
        datum.median    = d3.median(descendantValues);
        datum.variance  = d3.variance(descendantValues);
        datum.deviation = d3.deviation(descendantValues);
        datum.maxZ      = d3.max(descendantValues, d => (d - datum.mean) / datum.deviation); // z-score
        datum.minZ      = d3.min(descendantValues, d => (d - datum.mean) / datum.deviation); // z-score 
        datum.minP = pValues[0]; // percentage values. min/max value as expressed as a percentage of the first data point (year 0).
        datum.maxP = pValues[1]; // percentage values. min/max value as expressed as a percentage of the first data point (year 0).

        return descendantValues;
    }
 
function hashValues(d){
    return d.reduce((acc, cur) => acc + cur.value, '').hashCode();
}
   


d3.formatLocale({
    decimal: '.',
    thousands: ',',
    grouping: [3],
    currency: ['$', '']
});

const years = Array.from(fieldValues.year.values()).sort();
const margin = {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5
};
const viewBoxHeight = 50;
const height = viewBoxHeight - margin.top - margin.bottom;
const width = 100 - margin.left - margin.right;
const yScale = d3.scaleLinear().range([height, 0]);//.domain(equalRange);  
const xScale = d3.scaleLinear().range([0, width]).domain([years[0], years[years.length - 1]]);


const valueline = d3.line()
    .x(d => {
        return xScale(d.x);
    })
    .y(d => {
       // return yScale(d.y);
       // return yScale(d.z);
       return yScale(d.p);
    });

function createSVG(datum){

    // TODO: how is this scaled -- whould be by percentage value, I believe
   console.log(datum);
    /* put each graph on its own scale filling full range */
    //yScale.domain([datum.min, datum.max]); 
    /* put all graphs in a column on a shared scale acc to min and max value among them */
  //  var maxAbsP = d3.max([Math.abs(datum.parent.minP), Math.abs(datum.parent.maxP)]);
  //  yScale.domain([0 - maxAbsP, maxAbsP]); 

  //yScale.domain([datum.parent.minZ, datum.parent.maxZ]);
  yScale.domain([datum.parent.minP, datum.parent.maxP]); // scale each line based on min.max domain from parent pValues
    
    var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    /* put each column of charts on its own scale. ie each property on same scale, comparable */
    //yScale.domain([d3.min(parent.values, v => v.min), d3.max(parent.values, v => v.max)]);
    var g = d3.select(svg)
        .attr('viewBox', '0 0 100 ' + viewBoxHeight)
        .attr('focusable', false)
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('version', '1.1')
        .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        g.append('path')
        .datum( () => {
            var _d = years.map(year => {
                return {
                    x: year,
                    /* based on absolute value */
                    y: datum.values.find(d => d.key == year).value,
                    /* z-score */
                    z: ( datum.values.find(d => d.key == year).value - datum.parent.mean ) / datum.parent.deviation,

                    p: ( datum.values.find(d => d.key == year).value - datum.values.find(d => d.key == years[0]).value ) / datum.values.find(d => d.key == years[0]).value
               };
            });
            return _d;
        })
        .attr('d', valueline)
        .attr('class', 'sparkline ' + datum.key);

        g.append('g')
            .attr('class','circles')
            .selectAll('circle').data(datum.values)
            .enter().append('circle')
            .attr('cx', d => xScale(d.key))
            .attr('cy', d => yScale(( d.value - datum.values[0].value ) / datum.values[0].value ) )
            .attr('r',3)
            .attr('class', datum.key);
    this.appendChild(svg);

}
const container = d3.select('#render-here');

var sections = container
    .selectAll('section')
    .data(nestedData, function(d){ return d ? d.key : this.getAttribute('data-key');});

    {
        let entering = sections
            .enter().append('section')
            .attr('data-key', d => d.key);

        entering.append('h2')
            .text(d => d.key);

        let table = entering.append('table');

        table.append('thead')
            .selectAll('th')
            .data(['', ...fieldValues.property]) // TODO:  use metadata for display value
            .enter().append('th')
            .attr('scope', (d,i) => i == 0 ? null :'column')
            .text(d => d);
        
        table.append('tbody');

        // handling enter separately for prerendering. 
        sections = sections.merge(entering);
    }
sections.each(function(data){
    var section = d3.select(this);
    var rows = section.selectAll('tbody')
        .selectAll('tr')
        .data(d => [...fieldValues[d.key]], function(_d){ return _d ? _d : this.getAttribute('data-key');});

        {
            let entering = rows
                .enter().append('tr')
                .attr('data-key', d => d);

            entering.append('th')
                .attr('scope','row')
                .text(d => d);

            rows = rows.merge(entering);
            rows.exit().remove();
        }

    var cells = rows.selectAll('td') // TODO: seems this setup must not be right. why call hashValues twice?
            .data(d => [...fieldValues.property].map(p => data.values.find(_d => _d.key == p).values.find(__d => __d.key == d)), function(d){ return d ? hashValues(d.values) : this.getAttribute('data-hash');});

        {
            let entering = cells
                .enter().append('td')
                .attr('data-hash', d => hashValues(d.values));
                //.each(createSVG);

            cells = cells.merge(entering);
            cells.exit().remove();

        }

});


    // below each <td> is keyed by a hash of the data it will hold so that at runtime cells with 
    // data that match the buildtime data will not be overwritten
/*var cells = rows.selectAll('td') // TODO: seems this setup must not be right. why call hashValues twice?
        .data(d => d.values, function(d){ return d ? hashValues(d.values) : this.getAttribute('data-hash');});

    {
        let entering = cells
            .enter().append('td')
            .attr('data-hash', d => hashValues(d.values));
            //.each(createSVG);

        cells = cells.merge(entering);
        cells.exit().remove();

    }




    
/*const SVGs = nestedData[0].values.reduce((acc,property) => {
acc[property.key] = createSVG(property);
    return acc;
},{});
   

console.log(SVGs);*/
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
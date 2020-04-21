import './css/styles.scss';
import d3 from './d3-importer.js';
import data from './data/data.csv';

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

const sums = {};
const percents = {};
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



function nestBy(fields,data){
    return fields.reduce(function(acc,cur){
        return acc.key(d => d[cur]);
    },d3.nest()).rollup(leaves => {
        var sum =  Math.round(d3.sum(leaves, l => l.value));
        var percentages = leaves.reduce((acc,cur) => {
            acc.push( (cur.value - leaves[0].value) / leaves[0].value);
            return acc;
        },[]);
        sums[leaves[0].property] = sums[leaves[0].property] ? [...sums[leaves[0].property],sum] : [sum];
        percents[leaves[0].property] = percents[leaves[0].property] ? [...percents[leaves[0].property],sum] : [...percentages];
        return sum;
    }).entries(data);
}

console.log(sums, percents);
var nestedData = nestBy(['ocean','property','year'], data);
console.log(nestedData);
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
});
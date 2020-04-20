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

const yScale = d3.scaleLinear().range([height, 0]);  // to be completed each instance
const xScale = d3.scaleLinear().range([0, width]).domain([years[0], years[years.length - 1]]);

/*const minMax = ['volume','catch_value','sales_value'].reduce(function(acc,cur){
    console.log(data.filter(d => d.property == cur));
    acc[cur] = [d3.min(data.filter(d => d.property == cur), d => d.value), d3.max(data.filter(d => d.property == cur), d => d.value)];
    return acc;
},{});*/

const sums = {};
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
            console.log(d3.min(sums[property]), d3.max(sums[property]));
            return yScale.domain( [d3.min(sums[property]), d3.max(sums[property])] )(d.y);
        });
}



function nestBy(fields,data){
    return fields.reduce(function(acc,cur){
        return acc.key(d => d[cur]);
    },d3.nest()).rollup(leaves => {
        var sum =  Math.round(d3.sum(leaves, l => l.value));
        sums[leaves[0].property] = sums[leaves[0].property] ? [...sums[leaves[0].property],sum] : [sum];
        return sum;
    }).entries(data);
}

console.log(sums);
var nestedData = nestBy(['ocean','property','year'], data);
console.log(nestedData);
function renderTable(){
    var rows = d3.select('#d3-container')
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
                        y: d.values.find(d => d.key == year).value
                    };
                }))
                .attr('d', returnValueline(d.key))
                .attr('class', 'sparkline');
        })


}


renderTable();
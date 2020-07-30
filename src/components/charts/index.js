/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import d3 from '@Project/d3-importer.js';
import StringHelpers from '@Submodule/UTILS';
import s from './styles.scss';
import dictionary from '@Project/data/dictionary.json';

/*if ( module.hot ){
    module.hot.accept('./styles.scss');
}*/
 
const margin = {
    top: 5,
    right: 35,
    bottom: 5,
    left: 5
};
const viewBoxHeight = 50;
const height = viewBoxHeight - margin.top - margin.bottom;
const width = 100 - margin.left - margin.right;
const yScale = d3.scaleLinear().range([height, 0]);
const xScale = d3.scaleLinear().range([0, width]);
const container = d3.select('#render-here');
const valueline = d3.line()
    .x(d => {
        return xScale(d.x);
    })
    .y(d => {
       return yScale(d.p);
    });
function formatTypes(precision){
    return {
        v: `,.${precision}s`,
        dv: `$,.${precision}s`,
        ev: `$,.${precision}s`
    }
}
const tip = d3.tip()
    //.direction('n')
    .attr('class', `${s['d3-tip']} ${s.n}`)
    //.offset([-8, 0])
    .html((d,i,arr) => {
        return d.reduce(function(acc,cur,j){
            return acc + `<div class="${s.tooltipDiv}${i == j ? ' ' + s.currentYear : ''}">${cur.x}: ${abbrev({value: cur.y, type: cur.column, precision: 3})}</div>`;
        }, '');
    });
function hashValues(d){
    return d.reduce((acc, cur) => acc + cur.value, '').hashCode();
}
function display(key){
    return dictionary[key].display;
}
function description(key){
    return dictionary[key].description;
}
function abbrev({value, type, precision}){
    console.log(type);

    return d3.format(formatTypes(precision)[type])(value).replace('G','B');
}
function units(key){
    return dictionary[key].units;
}
d3.formatLocale({
    decimal: '.',
    thousands: ',',
    grouping: [3],
    currency: ['$', '']
});


export function initCharts({nestedData,fieldValues}){
    function returnDatum(datum){
        return years.map(year => {
            return {
                row: datum.key,
                column: datum.parent.key,
                x: year,
                /* based on absolute value */
                y: datum.values.find(d => d.key == year).value,
                /* z-score */
                z: ( datum.values.find(d => d.key == year).value - datum.parent.mean ) / datum.parent.deviation,
                /* percentage change */
                p: ( datum.values.find(d => d.key == year).value - datum.values.find(d => d.key == years[0]).value ) / datum.values.find(d => d.key == years[0]).value
           };
        });
    }
    function initTooltips(datum){
        var cell = d3.select(this);
        var svg = cell.select('svg');
        var bars = svg.selectAll('.' + s.dummyBars + ' rect');
        svg.call(tip);
        bars
            .data(years.map(() => returnDatum(datum)))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);


    }
    function createSVG(datum){
        var greatestExtent = Math.max(Math.abs(datum.parent.parent.parent.minP), Math.abs(datum.parent.parent.parent.maxP));
        yScale.domain([-greatestExtent, greatestExtent]); // scale each line based on min.max domain from parent pValues
        
        var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
        var g = d3.select(svg)
            .attr('class', s.chartSVG)
            .attr('viewBox', '0 0 100 ' + viewBoxHeight)
            .attr('focusable', false)
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('version', '1.1')
            .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`)
                .datum(returnDatum(datum));

            g.append('path')
                .attr('d', valueline)
                .attr('class', `${s.sparkline} ${s[datum.parent.key]}`); //parent key to get class of column, not row

            g.append('g')
                .attr('class', s.circles)
                .selectAll('circle')
                .data(d => d)
                .enter().append('circle')
                    .attr('cx', d => xScale(d.x))
                    .attr('cy', function(d){
                        return yScale(d.p);
                     })
                    .attr('r',3)
                    .attr('class', s[datum.parent.key]) //parent key to get class of column, not row
                    .classed(s.isLast, (d,i,arr) => i == arr.length - 1);

            g.append('text')
                .attr('class',`${s.dataPoint} ${s[datum.parent.key]}`)
                .attr('x', d => xScale(d[d.length - 1].x))
                .attr('y', d => yScale(d[d.length - 1].p))
                .attr('dy', '0.3em')
                .attr('dx', '0.5em')
                .text(d => abbrev({value: d[d.length - 1].y, type: datum.parent.key, precision: 3}));

            g.append('g')
                .attr('class', s.dummyBars)
                .selectAll('rect')
                .data(d => {
                    console.log(datum);
                    return d;
                })
                .enter().append('rect')
                    .attr('x', (d,i,arr) => xScale(d.x) - ( (width) / ( arr.length - 1 )) / 2)
                    .attr('width', (d,i,arr) => (width) / ( arr.length - 1 ) )
                    .attr('height', height);
                    
        
        this.appendChild(svg);

    }
    var years = Array.from(fieldValues.year.values()).sort();
    xScale.domain([years[0], years[years.length - 1]]);
    var sections = container
        .selectAll('section')
        .data(nestedData.values, function(d){ return d ? d.key : this.getAttribute('data-key');});

        {
            let entering = sections
                .enter().append('section')
                .attr('class', s.chartSection)
                .attr('data-key', d => d.key);

            entering.append('h2')
                .text(d => display(d.key));

            entering.append('p')
                .attr('class', s.intro)
                .text(d => description(d.key));

            let table = entering.append('table');

            table.append('thead')
                .selectAll('th')
                .data(['', ...fieldValues.property]) // TODO:  use metadata for display value
                .enter().append('th')
                .attr('scope', (d,i) => i == 0 ? null :'column')
                .html(d => d ? `${display(d)}${ units(d) ? ' <span class="' + s.units + '">(' + units(d) + ')</span>' : ''}`: '');
            
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
                    .text(d => display(d));

                rows = rows.merge(entering);
                rows.exit().remove();
            }

        // remember the rendering of the tables follows a different sequence then the nesting of the data so we
        // have to manually find the data needed for each the cells of each row
        var cells = rows.selectAll('td') // TODO: seems this setup must not be right. why call hashValues twice?
                .data(d => [...fieldValues.property].map(p => data.values.find(_d => _d.key == p).values.find(__d => __d.key == d)), function(d){ return d ? hashValues(d.values) : this.getAttribute('data-hash');});

            {
                let entering = cells
                    .enter().append('td')
                    .attr('data-hash', d => hashValues(d.values))  
                    .each(createSVG);

                cells = cells.merge(entering);
                cells.exit().remove();
                cells.each(initTooltips);

            }
       /* cells.selectAll('svg.' + s.chartSVG)
            .call(tip);
        
        cells.selectAll('.' + s.dummyBars + ' rect' )
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);*/

    });
/*
    d3.selectAll('svg.' + s.chartSVG)
        .call(tip);
 
    d3.selectAll('.' + s.dummyBars + ' rect' )
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);*/
}
/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import d3 from '@Project/d3-importer.js';
import StringHelpers from '@Submodule/UTILS';
import s from './styles.scss';
import dictionary from '@Project/data/dictionary.json';
import { returnFieldValues, returnNestedData } from '@Project/scripts/data.js';
import { OrganizeBy, Filters, HasFiltersApplied } from '@Project/store.js';
import organize from './organize.js';
import { isWorking } from '@Project/index.js';
import tippy from 'tippy.js';

var organizeBy;
var subsequentFilter = false;
var fieldValues;
OrganizeBy.subscribe(v => {
    organizeBy = v;
    _organize(v);
});
Filters.subscribe(() => {
    if ( subsequentFilter ){
        isWorking(true);
        updateCharts();
    }
    subsequentFilter = true;
});

var Sections = [];
// [{rfmo: [{section: <section>, rows:[<row>,<row>,...],{},...}]}]
// construct a model of the sections and their rows when they are rendered so that
// we don't need to query the DOM for them every time we need to refer to them later
function logSection(depth, d, i, arr) {
    var sect = {
        section: arr[i],
        rows: arr[i].querySelectorAll('tr.js-row-level-' + depth)
    };

    Sections[depth] = Sections[depth] || {};
    Sections[depth][d.key] = Sections[depth][d.key] || [];
    Sections[depth][d.key].push(sect);
    console.log(Sections);
}
function closeAllRows(){
    document.querySelector('#render-here').querySelectorAll('tr').forEach(row => {
        if ( row.isExpanded ){
            row.isExpanded = false;
        }
    });
}
function _organize(orgBy) {
    if (orgBy == undefined) {
        return;
    }
    [3, 2, 1, 0].forEach(i => {
        if (Sections[i]) {
            if (orgBy[i] == undefined) {
                Object.values(Sections[i]).forEach(nodeArr => {
                    nodeArr.forEach(node => {
                        node.section.style.display = 'block';
                    });
                });
            } else {
                Object.values(Sections[i]).forEach(nodeArr => {
                    nodeArr.forEach(node => {
                        node.section.style.display = 'none';
                    });
                });
                if (Sections[i][orgBy[i]]) {
                    Sections[i][orgBy[i]].forEach(node => {
                        node.section.style.display = 'block';
                       /* var shouldOpenRows = !!orgBy[i + 1];
                        node.rows.forEach(row => {
                            if ( !row.isExpanded == shouldOpenRows ){
                                row.dispatchEvent(new MouseEvent('click', {
                                    view: window,
                                    bubbles: false,
                                    cancelable: true
                                }));
                            }
                        });*/
                        isWorking(false);
                    });
                }
            }
        }

    });
}

if (module.hot) {
    module.hot.accept('./styles.scss');
}

const margin = {
    top: 9,
    right: 51,
    bottom: 10,
    left: 45
};
const r = 2.7; 
const strokeWidth = 2.2            ;
const viewBoxWidth = 150;
const viewBoxHeight = 70;
const tickLength = 6;
const safety = 2;
const height = viewBoxHeight - margin.top - margin.bottom;
const width = viewBoxWidth - margin.left - margin.right;
//const yScale = d3.scaleLinear().range([height, 0]);
const yScale = d3.scaleSymlog().range([height, 0]);
const xScale = d3.scaleLinear().range([0, width]);
const valueline = d3.line()
    .x(d => {
        return xScale(d.x);
    })
    .y(d => {
        return yScale(d.p);
    });

function formatTypes(precision) {
    return {
        v: `,.${precision}~s`,
        dv: `$,.${precision}~s`,
        ev: `$,.${precision}~s`
    }
}
const tip = d3.tip()
    //.direction('n')
    .attr('class', `${s['d3-tip']} ${s.n}`)
    //.offset([-8, 0])
    .html((d, i, arr) => {
        return d.reduce(function(acc, cur, j) {
            return acc + `<div class="${s.tooltipDiv}${i == j ? ' ' + s.currentYear : ''}">${cur.x}: ${abbrev({value: cur.y, type: cur.column, precision: 3})}</div>`;
        }, `<section class="${s[d[0].column]}"><h1 class="${s.tooltipHead}">${display(d[0].column)}</h1>`) + '</section>';
    });

function hashValues(d) {
    return d.reduce((acc, cur) => acc + cur.value, '').hashCode();
}

function display(key) {
    return dictionary[key].display;
}
function textTooltip(key){
    return dictionary[key] ? dictionary[key].description || null : null;
}
function displayFilters(filters) {
    if (filters.length == 0) {
        return '';
    }
    return filters.reduce(function(acc, cur, i, arr) {
        return acc + `<span>${display(cur[0])}:</span> ${display(cur[1])} `;
    }, '(') + ')';
}

function description(key) {
    return dictionary[key].description;
}
String.prototype._replaceAbbrev = function(){
    return this.replace('G', 'b').replace('M', 'm');
}
function abbrev({ value, type, precision }) {
    return d3.format(formatTypes(precision)[type])(value)._replaceAbbrev();
}

function units(key) {
    return dictionary[key].units;
}

function returnSubcontainer(parent) {
    if ( parent.expansionChild ) {
        return parent.expansionChild;
    }
    var row = document.createElement('tr');
    var cell = document.createElement('td');
    cell.setAttribute('colspan', fieldValues.property.size + 2);
    cell.classList.add(s.childCell);
    row.appendChild(cell);
    parent.insertAdjacentElement('afterend', row);
    return cell;
}
d3.formatLocale({
    decimal: '.',
    thousands: ',',
    grouping: [3],
    currency: ['$', '']
});
function removeNode(selection){
    /*selection.attr('class', s.rowIsExiting)
    .transition().duration(500)
    .on('end', function(){
        selection.remove();
    });*/
    selection.remove();
}
function rowClickHandler(d, sortBy, sortDirection) {
    if ( this.classList.contains('js-has-no-values') ){
        return;
    }
    if (this.classList.contains('js-child-is-loaded')) {
        this.isExpanded = !this.isExpanded;
        return; // here handle the expanding/collapsing of already loaded children
        // include aria-expanded, etc.
    }
    var rowKeys = JSON.parse(this.dataset.keys);
    var rowValues = JSON.parse(this.dataset.values);
    this.rowFilters = rowKeys.map((key, i) => [key, rowValues[i]]);
    this.button = this.querySelector('.js-expand-button');
    this.classList.add('js-child-is-loaded');
    this.expansionChild = initCharts({ filters: this.rowFilters, sortBy, sortDirection, appendAfter: this });
    this.isExpanded = true;
}
function returnNiceValues(domain){
    //domain[1] = 0.24968
    var powerTen = Math.floor(Math.log10(domain[1])); // -1
    var simplified = domain[1] / 10 ** powerTen; // 2.24968
    var decimals = simplified % 1; // 0.24968
    var posValue;
    if ( powerTen > -1 ){
        posValue = ( Math.floor(simplified) + Math.floor(decimals / 0.25) * 0.25 ) * ( 10 ** powerTen);
    } else {
        posValue = ( Math.floor(simplified) + Math.floor(decimals / 0.5) * 0.5 ) * ( 10 ** powerTen);
    }
    return [posValue, -posValue];
}
export function initCharts({ filters = [], sortBy = 'ev', sortDirection = 'desc', appendAfter = null }) {
    // filters = Array of key, value arrays corresponding to the row clicked
    var nestedData = returnNestedData(filters);
    fieldValues = returnFieldValues();
    var sortedFieldValues = nestedData.values.reduce(function(acc,cur){
        acc[cur.key] = [...fieldValues[cur.key]].sort(sortFieldValues.bind(undefined, cur));
        return acc;
    },{});
    console.log(nestedData);
    var container = !appendAfter ? d3.select('#render-here') : d3.select(returnSubcontainer(appendAfter));
    if (filters.length > 0) {
        container
            .attr('id', filters.map(f => f[1]).join('-'));
    }

    function returnDatum(datum) {
        return datum.values.map((value, i, arr) => {
            return {
                row: datum.key,
                column: datum.parent.key,
                x: value.key,
                y: value.value,
                z: (value.value - datum.parent.mean) / datum.parent.deviation,
                p: (value.value - arr[0].value) / arr[0].value
            };
        });
    }

    function initTooltips(datum) {
        if ( datum == '' ){
            return;
        }
        var cell = d3.select(this);
        var svg = cell.select('svg');
        var bars = svg.selectAll('.' + s.dummyBars + ' rect');
        svg.call(tip);
        bars
            .data(years.map(() => returnDatum(datum)))
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);
    }

    function sortFieldValues(d, a, b) {
        var columnValues = d.values.find(d => d.key == sortBy).values;
        var ab = [a, b].map(fv => {
            var yearValues = columnValues.find(d => d.key == fv).values;
            return yearValues.length > 0 ? yearValues[yearValues.length - 1].value : 0;
        });
        return sortDirection == 'desc' ? ab[1] - ab[0] : ab[0] - ab[1];
    }

    function createSVG(datum, cellIndex, arr) {
        if ( cellIndex == arr.length - 1 ){
            return;
        }
        var greatestExtent = Math.max(Math.abs(datum.parent.parent.parent.minP), Math.abs(datum.parent.parent.parent.maxP));
        yScale.domain([-greatestExtent, greatestExtent]); // scale each line based on min.max domain from parent pValues
        var svg = d3.select(this)
            .selectAll('svg')
            .data((datum.descendantValues.every(d => d === 0) ? [] : [1]));

        svg.exit().each(function(){
            d3.select(this.parentNode)
                .text('n.a.');
            d3.select(this).remove();
        });
        svg.enter().each(function(){
            this._parent.textContent = '';
        });


        {
            let entering = svg.enter()
                .append('svg')
                .attr('class', `js-chart-svg ${s.chartSVG}`)
                .attr('viewBox', `0 0 ${viewBoxWidth} ${viewBoxHeight}`)
                .attr('xmlns', 'http://www.w3.org/2000/svg')
                .attr('version', '1.1')
                .attr('role', 'img')
                .attr('aria-labelledby', `title-${filters.map(f => f[1]).join('-')}-${datum.parent.parent.key}-${datum.key}-${datum.parent.key} ` +
                    `desc-${filters.map(f => f[1]).join('-')}-${datum.parent.parent.key}-${datum.key}-${datum.parent.key}`);

            entering.append('title')
                .attr('id', `title-${filters.map(f => f[1]).join('-')}-${datum.parent.parent.key}-${datum.key}-${datum.parent.key}`)
                .text(() => {
                    return `Line graph showing the ${display(datum.parent.key)} of tuna caught ` +
                        `in each of ${datum.values.length} years for ${display(datum.parent.parent.key)}: ` +
                        `${display(datum.key)}.`;
                });

            entering.append('desc')
                .attr('id', `desc-${filters.map(f => f[1]).join('-')}-${datum.parent.parent.key}-${datum.key}-${datum.parent.key}`)
                .text(() => {
                    return datum.values.reduce(function(acc, cur, j) {
                        return acc + `${cur.key}: ${abbrev({value: cur.value, type: cur.parent.parent.key, precision: 3})}${ j < datum.values.length - 1 ? '; ' :''}`;
                    }, '');
                });

            let defs = entering
                .append('defs');

                defs
                    .append('marker')
                    .attr('class',s.arrowMarker)
                    .attr('id', 'end-arrow')
                    .attr('orient', 'auto')
                    .attr('markerWidth', 3)
                    .attr('markerHeight', 6)
                    .attr('refX', 3.1)
                    .attr('refY', 3)
                        .append('path')
                        .attr('d', 'M0,0 V6 L3,3 Z')
                        //.attr('fill', '$b0b0b0');

                defs
                    .append('marker')
                    .attr('class',s.arrowMarker)
                    .attr('id', 'start-arrow')
                    .attr('orient', 'auto')
                    .attr('markerWidth', 3)
                    .attr('markerHeight', 6)
                    .attr('refX', 0.1)
                    .attr('refY', 3)
                        .append('path')
                        .attr('d', 'M0,3 L3,0 V6 Z')
                        //.attr('fill', '$b0b0b0');


            svg = svg.merge(entering);
        }

        if ( !(cellIndex == 2 && datum.rowIndex == 0) ){
            svg.select('g.legend-group').remove();
        } else {
            let legendGroup = svg.selectAll('g.legend-group')
                .data([datum]);

            { 
                let entering = legendGroup.enter()
                    .insert('g', ':first-child')
                    .attr('class', `${s.legendGroup} legend-group`);


                legendGroup = legendGroup.merge(entering);
            }

            let ticks = legendGroup.selectAll('g.ticks')
                .data(d => d.values);

                {
                    let entering = ticks.enter()
                        .append('g')
                        .attr('class', `ticks ${s.ticks}`)
                        .attr('transform', (d,i) => `translate(${margin.left + xScale(+d.key)} 0)`);

                    entering.append('text')
                        .attr('text-anchor', 'middle')
                        .attr('y', (d,i) => i % 2 ? safety : viewBoxHeight - safety)
                        .attr('dy', (d,i) => i % 2 ? '0.6em' : 0 )
                        .text(d => d.key);

                    entering.append('line')
                        .attr('x1', 0)
                        .attr('x2', 0)
                        .attr('y1', (d,i) => {
                            var datum = returnDatum(d.parent).find(_d => _d.x == d.key);
                            return i % 2 ? margin.top / 1.3 : margin.top + yScale(datum.p);
                        })
                        .attr('y2', (d,i) => {
                            var datum = returnDatum(d.parent).find(_d => _d.x == d.key);
                            return i % 2 ? margin.top + yScale(datum.p) : margin.top + height + margin.bottom -  margin.bottom / 1.3;
                        });


                        
                }

            let axisTitle = legendGroup.selectAll('.y-axis-title')
                .data([1]); 

                {
                    let entering = axisTitle.enter()
                        .append('text')
                        .attr('class', `y-axis-title ${s.yAxisTitle}`)
                        .classed(s.isChild, filters.length > 0)
                        .attr('y',0)
                        .attr('x', margin.left - tickLength)
                        .attr('text-anchor', 'end')
                        .text('% change')
                        .attr('dy', '0.6em');

                }

            let yTicks = legendGroup.selectAll('g.y-ticks')
                .data([returnNiceValues(yScale.domain())[0], 0, returnNiceValues(yScale.domain())[1]]);

                {
                    let entering = yTicks.enter()
                        .append('g')
                        .attr('transform', d =>  {
                            return `translate(${margin.left - r - strokeWidth} 0)`;
                        })
                        .attr('class', `${s.yTicks} y-ticks`);

                    entering.append('line')
                        .attr('x1',0)
                        .attr('x2', -tickLength)
                        .attr('y1', 0)
                        .attr('y2', 0);

                    let tickText = entering.append('text')
                        .attr('text-anchor', 'end')
                        .attr('dy', '0.4em');
                        
                    tickText 
                        .append('tspan')
                        .attr('x',-tickLength)
                        .attr('dx', '-0.2em')
                        .attr('class','tick-label');
                        
                    
                   

                    yTicks = yTicks.merge(entering);
                }

            yTicks
                .attr('transform', d =>  {
                    return `translate(${margin.left - r - strokeWidth} ${margin.top + yScale(d)})`;
                });

            yTicks.select('.tick-label')
                .text((d,i) => i == 1 ? '0' : d3.format('+.3~s')(d * 100).replace('-','–') + '%'._replaceAbbrev());

          /*  yTicks.select('.y-axis-title')
                .text((d,i) => i == 0 ? '% change' : ''); */

        }

        var g = svg
            .selectAll('g.margin')
            .data([[returnDatum(datum)],[returnDatum(datum)]]);

            {
                let entering = g.enter()
                    .append('g')
                    .attr('class', 'margin')
                    .classed(s.dummyGroup, (d,i) => i == 0)
                    .attr('transform', `translate(${margin.left},${margin.top})`);

//                entering.append('rect').attr('x', 0).attr('y',0).attr('width', width).attr('height', height).attr('stroke', 'magenta').attr('fill', 'none').attr('stroke-width','0.5px');
  //              entering.append('rect').attr('x', 0).attr('y', 0 - r - strokeWidth).attr('width', width).attr('height', height + 2 * r + 2 * strokeWidth).attr('stroke', 'cyan').attr('fill', 'none').attr('stroke-width','0.5px');

                g = g.merge(entering);
            }
        g.each(function(gData, gIndex){
            var g = d3.select(this);
            var path = g.selectAll('path.sparkline')
                .data(d => d); // [{}]
                {
                    let entering = path.enter()
                        .append('path')
                        .attr('class', `sparkline ${s.sparkline} ${s[datum.parent.key]}`) //parent key to get class of column, not row
                        .classed(s.dummyLine, gIndex == 0)
                        .attr('stroke-width', gIndex == 0 ? strokeWidth * 2 : strokeWidth)
                        .attr('d', `M0,${yScale(0)}L${width},${yScale(0)}`);

                    path = path.merge(entering);
                }

                //existing paths
                path.transition().duration(750).attr('d', valueline);

            var gCircles = g.selectAll('g.circles')
                .data(d => d);

                {
                    let entering = gCircles.enter()
                        .append('g')
                        .attr('class', `circles ${s.circles}`);
                        

                    gCircles = gCircles.merge(entering);
                }

            var circles = gCircles
                .selectAll('circle')
                .data(d => d);
                
                circles.exit().remove(); //TODO KEY BY YEAR TO PREVENT TRANSITIONING ALONG XAXIS

                {
                    let entering = circles.enter()
                        .append('circle')
                        .attr('cx', d => xScale(d.x))
                        .attr('cy', function(d) {
                            return yScale(0);
                        })
                        .attr('r', gIndex == 0 ? 2 * r : r)
                        .attr('stroke-width', strokeWidth)
                        .attr('class', s[datum.parent.key]) //parent key to get class of column, not row
                        .classed(s.dummyCircle, gIndex == 0);

                    circles = circles.merge(entering);
                }
                // update existing
                circles
                    .classed(s.isLast, (d, i, arr) => i == arr.length - 1)
                    .transition().duration(750)
                    .attr('cx', d => xScale(d.x))
                    .attr('cy', function(d) {
                        return yScale(d.p);
                    });
            if ( gIndex == 1 ){
                 let datalabel = g.selectAll('text')
                    .data(d => d);

                    {
                    let entering = datalabel.enter()
                        .append('text')
                        .attr('class', `${s.dataPoint} ${s[datum.parent.key]}`)
                        .attr('x', d => xScale(d[d.length - 1].x))
                        .attr('dy', '0.3em')
                        .attr('dx', '0.5em');

                        datalabel = datalabel.merge(entering);
                    }

                    //update existing
                    datalabel
                        .text(d => abbrev({ value: d[d.length - 1].y, type: datum.parent.key, precision: 3 }))
                        .transition().duration(200)
                            .attr('x', d => xScale(d[d.length - 1].x))
                            .attr('y', d => yScale(d[d.length - 1].p));

                let dummyBarGroup = g.selectAll('g.dummy-bars')
                    .data(d => d);
                    {
                        let entering = dummyBarGroup.enter()
                            .append('g')
                            .attr('class', `dummy-bars ${s.dummyBars}`);

                        dummyBarGroup = dummyBarGroup.merge(entering);
                    }

                let dummyRects = dummyBarGroup.selectAll('rect')
                    .data(d => d, _d => _d.x);
                    dummyRects.exit().remove();

                    {
                        let entering  = dummyRects.enter()
                        .append('rect')
                        .attr('data-year', d => d.x)
                        .attr('x', (d, i, arr) => xScale(d.x) - ( ( width / (years.length - 1) ) / 2 ) )// - ((width) / (years.length - 1)) / 2)
                        .attr('width', (d, i, arr) => width / (years.length - 1))
                        .attr('height', height);

                        dummyRects = dummyRects.merge(entering);
                    }

            }
        }); // end g.each()
    } // end createSVG
    var years = Array.from(fieldValues.year.values()).sort();
    xScale.domain([years[0], years[years.length - 1]]);
    // TODO STARTING HERE GO THROUGH AND MAKE SURE SELECTALL IS CAPTURING EXISTING LEVELS THROUGHOUT
    var sections = container
        .selectAll(`section.js-chart-section${filters.length}`)
        .data(nestedData.values, function(d) { 
            return d ? d.key : this.getAttribute('data-key');
        });

    {
        let entering = sections
            .enter().append('section')
            .attr('class', `js-chart-section js-chart-section${filters.length} ${s.chartSection} ${s['chartSection' + filters.length]}`)
            .classed(s.isLastSection, nestedData.values.length == 1)
            .attr('data-key', d => d.key)
            .style('display', function(d) {
                if (!organizeBy || organizeBy[filters.length] == undefined || organizeBy[filters.length] == d.key) {
                    return 'block'
                }
                return 'none';
            });



        // here you should assign the section to a variable or object in more general scope so 
        // that existing sections can be handle on subscribe to OrganizeBy
        let header = entering.append('h' + (filters.length + 2))
            .attr('class', s.sectionHead)
            .html(d => `<a id="head-${d.key}" class="${s.headAnchor}"></a>
                        <span>${display(d.key)}</span>
                        <span class="${s.filtersDisplay}">${displayFilters(filters)}</span>`);

        header.each(function(){
            if ( filters.length > 0 ){
                d3.select(this)
                    .append('button')
                    .text('Close all')
                    .attr('class', s.closeAllRows)
                    .on('click', closeAllRows);
            }
        });

        if (filters.length === 0) { //only add graf when no filters applied, ie, main tables

            entering.append('p')
                .attr('class', s.intro)
                .text(d => description(d.key));
        }

        let table = entering.append('table');

        if (filters.length === 0) { // table headers only if no filters applied, ie, main tables
            table.append('thead')
                .selectAll('th')
                .data(d => ['', ...fieldValues.property,''])
                .enter().append('th')
                .attr('scope', (d, i) => i == 0 ? null : 'column')
                .attr('data-tippy-content', d => textTooltip(d))
                .attr('class', d => s[d])
                .classed(s.sortedBy, d => {
                    return d == sortBy;
                })
                .classed(s.asc, d => d == sortBy && sortDirection == 'asc')
                .attr('width', (d,i,arr) => i == arr.length - 1 ? '20px' : null)
                .html(d => d ? `<span class="${s.columnTitle}">${display(d)}</span>${units(d) ? '<br /><span class="' + s.units + '">(' + units(d) + ')</span>' : ''}` : '');
        }

        table.append('tbody');

        // handling enter separately for prerenderin
        sections = sections.merge(entering);
    }
    sections.each(function(data) {
        var tbody = d3.select(this).select('tbody');
        var rows = tbody.selectAll(`tr.js-row-level-${filters.length}`)
            .data(() => {
                var rtn = sortedFieldValues[data.key];
                return rtn;
            }, function(_d) { // this second parameter of `.data()` sets the key by which to identify each data-bound element
                // needs to be IDd so that on page load the prerendered elements are not rerendered
                // `_d` is undefined for the prerendered elements captured by selectAll, so return that `data-value`
                // attribute instead.
                var rtn = _d ? JSON.stringify([...filters.map(f => f[1]), _d]) : this.getAttribute('data-values');
                console.log(filters, rtn);
                return rtn;
            });
            rows.classed(s.isEntering, false);
            rows.exit().each(function(){
                d3.select(this).call(removeNode);
                d3.select(this.expansionChild).call(removeNode);
            });
        {
            let entering = rows
                .enter().append('tr')
                .attr('data-keys', JSON.stringify([...filters.map(f => f[0]), data.key]))
                .attr('data-values', d => JSON.stringify([...filters.map(f => f[1]), d])) // eg W, IO, IA, etc
                .attr('data-index', function(d,i) {
                    return i;
                })
                .attr('class', s.isEntering + ' js-row js-row-level-' + filters.length);

            entering.each(function(){
                Object.defineProperty(this, 'isExpanded', {
                    get: function() { return this._isExpanded; },
                    set: function(value) {
                        this._isExpanded = value;
                        this.setAttribute('aria-expanded', value);
                        this.classList[value ? 'add' : 'remove'](s.isExpanded);
                        this.expansionChild.classList[value ? 'add' : 'remove'](s.isExpandedChild);
                        this.button.setAttribute('aria-label', value ? 'Click to collapse row' : 'Click to expand row');
                        this.setAttribute('title', value ? 'Click to collapse' : 'Click to expand');
                    }
                });
            });

            if (nestedData.values.length > 1) { // do not do expansion stuff if we're at the last branch of the tree
                entering
                    .attr('title', 'Click to expand')
                    .attr('aria-expanded', false)
                    .attr('aria-controls', d => [...filters.map(f => f[1]), d].join('-'))
            }

            let th = entering.append('th');

            th
                .attr('scope', 'row')
                .attr('data-tippy-content', d => textTooltip(d));
            th.text(d => display(d));
            if (nestedData.values.length > 1) {
                let btn = th.append('button')
                    .attr('class', 'js-expand-button ' + s.expandButton)
                    .attr('aria-label', 'Click to expand row');

                btn.each(function(d){
                    this.addEventListener('click', function(e){
                        console.log(this.parentElement.parentElement);
                        e.stopPropagation();
                        rowClickHandler.call(this.parentElement.parentElement, d, sortBy, sortDirection);
                    });
                });
            }

            rows = rows.merge(entering);
            rows.each(function(d){
                var allRowValues = data.values.reduce(function(acc, column){
                    acc.push(...column.values.find(v => v.key == d).values.map(v => v.value));
                    return acc;
                },[]);
                this.classList[allRowValues.length > 0 ? 'remove' : 'add'](s.hasNoValues, 'js-has-no-values');
                if ( allRowValues.length == 0 && this.isExpanded ){
                    this.isExpanded = false;
                }
                if ( this.expansionChild ){
                    initCharts({ filters: this.rowFilters, sortBy, sortDirection, appendAfter: this });
                }
            });
            if (nestedData.values.length > 1) { 
                rows.on('click', function(d) {
                    rowClickHandler.call(this, d, sortBy, sortDirection);
                });
            }
        }
        rows.selectAll('th').each(function(){
            this.addEventListener('click', function(e){
                if ( !document.body.classList.contains('has-hover') ){
                    e.stopPropagation();
                }
            })
        });

        // remember the rendering of the tables follows a different sequence then the nesting of the data so we
        // have to manually find the data needed for each the cells of each row
        var cells = rows.selectAll('td') // TODO: seems this setup must not be right. why call hashValues twice?
            .data(d => {
                var _d = [...fieldValues.property].map(p => {
                    var rtn =  data.values.find(_d => _d.key == p).values.find(__d => __d.key == d);
                    rtn.rowIndex = sortedFieldValues[rtn.parent.parent.key].indexOf(rtn.key); // add a rowIndex to the 
                                                                                             // datum so we can target the legend
                                                                                             // for first rows only
                    return rtn;
                });
                return [..._d, ''];
            });
            //, function(d) { return d ? hashValues(d.values) : this.getAttribute('data-hash'); }*/

        {
            let entering = cells
                .enter().append('td')
                /*.attr('data-hash', d => {
                    return hashValues(d.values);
                })*/
                .attr('class', (d,i,arr) => i == arr.length - 1 ? null : s[d.parent.key])
                .attr('width', (d,i, arr) => i == arr.length - 1 ? '20px' : null)
                .text((d,i,arr) => i == arr.length - 1 ? null : 'n.a'); // put in 'n.a.' for all cells. to be replaced by VSG in createSVG if data calls for it

            cells = cells.merge(entering);

        }
        cells.each(createSVG); // calling createSVG for all cells to update ones already existing
        cells.each(initTooltips);
        /* cells.selectAll('svg.' + s.chartSVG)
             .call(tip);
         
         cells.selectAll('.' + s.dummyBars + ' rect' )
             .on('mouseover', tip.show)
             .on('mouseout', tip.hide);*/

        // the d3 slection of rows has it in order based on data (sortedFieldValues),
        // but the DOM order is based on the first rendering. subsequent filtering
        // will require changing the order of the rows. FLIP.
        FLIP(rows);

    });
    tippy('[data-tippy-content]',
        {
            offset: [0,-10]
        });
    sections.each(logSection.bind(undefined, filters.length));
    /*
        d3.selectAll('svg.' + s.chartSVG)
            .call(tip);
     
        d3.selectAll('.' + s.dummyBars + ' rect' )
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);*/
    return container.node();
}
function FLIP($rows){
    var rows = $rows.nodes();
   // First(rows);
    Last(rows);
   // Invert(rows);
    requestAnimationFrame(function(){
   //     Play(rows);
    });
}
function First(rows){
    rows.forEach(row => {
        row.style.transitionDuration = '0s';

        row.yPos0 = row.getBoundingClientRect().top;
    });
}
function Last(rows){
    var parent = rows[0].parentNode;
    var frag = new DocumentFragment();
    rows.forEach(row => {
        frag.appendChild(row);
        if ( row.expansionChild ){ // expansionChild is the <td> need to move the parent <tr>
            frag.appendChild(row.expansionChild.parentNode);
        }
    });
    parent.appendChild(frag);
    rows.forEach(row => {
        row.yPos1 = row.getBoundingClientRect().top;
    });
}
function Invert(rows){
    rows.forEach(row => {
        row.style.transform = `translateY(${ row.yPos0 - row.yPos1 }px)`; 
        
    });
}
function Play(rows){
    rows.forEach(row => {
        row.style.transitionDuration = '0.3s';
    });
        rows.forEach(row => {
            row.style.transform = `translateY(0px)`; 
        });   
}
function updateCharts(){
    initCharts({});
    setTimeout(function(){
        isWorking(false);
    },500);
}
import './css/styles.scss';
import d3 from './d3-importer.js';
import data from './data/data.csv';

function nestBy(fields,data){
	return fields.reduce(function(acc,cur){
		return acc.key(d => d[cur]);
	},d3.nest()).rollup(leaves => Math.round(d3.sum(leaves, l => l.value))).entries(data);
}

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
		.enter().append('td');

}


renderTable();
/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */

var sections;
export default function _organize(orgBy){
    if ( !document.querySelector('.js-chart-section[data-key="rfmo"]') ){
        return;
    }
    sections = sections || {
        rfmo: document.querySelector('.js-chart-section[data-key="rfmo"]'),
        species: document.querySelector('.js-chart-section[data-key="species"]'),
        gear: document.querySelector('.js-chart-section[data-key="gear"]'),
        product: document.querySelector('.js-chart-section[data-key="product"]')
    };
    if ( orgBy.length == 0 ){
        Object.values(sections).forEach(s => {
            s.style.display = 'block';
        });
    } else {
        Object.values(sections).forEach(s => {
            s.style.display = 'none';
        });
        sections[orgBy[0]].style.display = 'block';
    }
}
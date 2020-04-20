import { ascending, extent, max, min, range, descending } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { entries, nest}         from 'd3-collection';
import { format, formatLocale } from 'd3-format';
import { path }                 from 'd3-path';
import { scaleTime,scaleLinear, scaleSqrt, scaleOrdinal } from 'd3-scale';
import { select, selectAll }               from 'd3-selection';
import { line }                 from 'd3-shape';
import { timeYear }             from 'd3-time';
import { timeParse, timeFormat }from 'd3-time-format';
import tip                      from 'd3-tip';
// TO DO: IMPORT ONLY WHAT'S NEEDED
export default {
    ascending,
    axisBottom,
    axisLeft,
    descending,
    entries,
    extent,
    format,
    formatLocale,
    line,
    max,
    min,
    nest,
    path,
    range,
    scaleOrdinal,
    scaleLinear,
    scaleSqrt,
    scaleTime,
    select,
    selectAll,
    timeFormat,
    timeParse,
    timeYear,
    tip
};
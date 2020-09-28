import { ascending, descending, deviation, extent, max, mean, median, min, range, sum, variance  } from 'd3-array';
import { axisBottom, axisLeft } from 'd3-axis';
import { entries, nest}         from 'd3-collection';
import { format, formatLocale } from 'd3-format';
import { path }                 from 'd3-path';
import { scaleLinear,scaleLog, scaleSymlog } from 'd3-scale';
import { select, selectAll }               from 'd3-selection';
import { arc, line, pie }                 from 'd3-shape';
import { timeYear }             from 'd3-time';
import { timeParse, timeFormat }from 'd3-time-format';
import tip                      from 'd3-tip';
import { transition }           from 'd3-transition';
// TO DO: IMPORT ONLY WHAT'S NEEDED
export default {
    arc,
    ascending,
    axisBottom,
    axisLeft,
    descending,
    deviation,
    entries,
    extent,
    format,
    formatLocale,
    line,
    max,
    mean,
    median,
    min,
    nest,
    path,
    pie,
    range,
    scaleLinear,
    scaleLog,
    scaleSymlog,
    select,
    selectAll,
    sum,
    timeFormat,
    timeParse,
    timeYear,
    tip,
    transition,
    variance
};
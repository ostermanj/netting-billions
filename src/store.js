import { writable } from 'svelte/store';

export const FilterIsClosed = writable(true);
export const OrganizeBy = writable(undefined);
export const DimensionFilter = writable(undefined);
export const Filters = writable({
    rfmo: [],
    species: [],
    gear: [],
    product: []
});
export const HasFiltersApplied = writable(false);
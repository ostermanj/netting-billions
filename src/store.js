import { writable } from 'svelte/store';

export const FilterIsClosed = writable(true);
export const OrganizeBy = writable(undefined);
export const DimensionFilter = writable(undefined);
<script>
/* eslint no-unused-vars: warn */
/* eslint no-undef: warn */
import dictionary from '@Project/data/dictionary.json';
import { xOut as XOut } from '@Submodule/UI-Svelte/';
import { DimensionFilter, Filters } from '@Project/store.js';
import { fieldValues } from '@Project/scripts/data.js';
import { get } from 'svelte/store';

export let section;
let labels = [];
let data = [...fieldValues[section]].sort().map(v => {
    return {
        key: v,
        display: dictionary[v].display
    }
});

export let selected = []; // changes committed to by submitting the form
export let dirtySelected = []; // changes not yet committed to
export let isDirty;
$:isDirty = !( 
        selected.every(item => dirtySelected.includes(item)) &&
        dirtySelected.every(item => selected.includes(item))
    );

let isOpen = false;
DimensionFilter.subscribe(v => {
 isOpen = v == section;
});
function inline(key){
    return dictionary[key].alwaysCaps ? dictionary[key].display : dictionary[key].display.toLowerCase();
}
function plural(key){
    var _inline = inline(key);
    return dictionary[key].pluralS ? _inline + 's' : _inline;
}
function keydownHandler(){

}
function changeHandler(e){
 if ( this.checked ){
    dirtySelected = [...dirtySelected, this.name];
    console.log(dirtySelected,e,this);
 } else {
    let i = dirtySelected.indexOf(this.name);
    dirtySelected.splice(i,1);
    dirtySelected = dirtySelected; // need to assign to trigger Svelte to update value
 }
}
function formSubmit(){
    selected = dirtySelected.slice(); // slicing to avoid binding by assignation
    var filters = get(Filters);
    filters[section] = selected;
    //TO DO: all checked is same as none checked
    Filters.set(filters);
    closeHandler();
}
function closeHandler(){
    DimensionFilter.set(undefined);
}
</script>
<style lang="scss">
    @import '../../css/variables.scss';
    .form-wrapper {
        position: absolute;
        right: 6px;
        top: 7px;
        min-width: 262px;
        padding-bottom: 10px;
        display: flex;
        flex-direction: column;
        border: 1px solid $light_gray;
        background-color: #fff;
        visibility: hidden;
        z-index: 1;
        &.isOpen {
            visibility: visible;
        }
    }
    .x-out-wrapper {
        position: absolute;
        top: 0;
        right: 0;
        background-color: #fff;
        padding-right: 10px;
    }
    .input-wrapper {
        display: flex;
        justify-content: center;
        position: relative;
        &::before {
            content: '';
            display: block;
            position: absolute;
            left: 0;
            top: -26px;
            width: 100%;
            height: 25px;
            background-image: linear-gradient(rgba(255,255,255,0), rgba(255,255,255,1), rgba(255,255,255,1) );
        }
    }
    fieldset {
        border: none;
        margin: 0;
        padding: 0;
    }
    legend {
        color: $dark_gray;
        font-weight: bold;
        padding: 0.625rem 9px;
    }
    form {
        //width: 100%;
        max-height: 235px;
        overflow-y: scroll;
        background-color: #fff;
        padding: 0 0 20px 0;
        display: block;
        font-size: 1rem;
        font-weight: normal;
        text-transform: none;
        border-bottom: 1px solid $light_gray;
        label {
            position: relative;
            display: block;
            color: $dark_gray;
            padding: 8px 16px 8px 32px;
            line-height: 100%;
            white-space: nowrap;
            overflow-x: hidden;
            text-overflow: ellipsis;
            &:hover {
                background-color: $lightest_gray;
            }
        }
        input[type="checkbox"] {
            position: absolute;
            left: 11px;
            top: 11px;
            width: 12px;
            height: 12px;
            background-color: #fff;
            margin: 0;
            padding: 0;
            border: 1px solid $gray;
            -webkit-appearance: none;
            appearance:none;
        }
        input[type="checkbox"]:checked::after {
            top: -1px;
            left: -1px;
            position: absolute;
            width: 12px;
            height: 12px;
            border-radius: 2px;
            display: block;
            content: " ";
            font-size: .625rem;
            line-height: 1;
            background-color: $pew_blue;
            color: #fff;
            text-align: center;
            background: url("data:image/svg+xml,%3Csvg id='Layer_1' data-name='Layer 1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 7.67 7.97'%3E%3Cpolyline points='0.35 5 2.55 7.19 7.26 0.28' style='fill:none;stroke:%23333;stroke-miterlimit:10'/%3E%3C/svg%3E") 50% 50% / 75% 75% no-repeat;
        }
    }
    input[type="submit"]{
        appearance: none;
        align-self: center;
        background-color: $pew_blue;
        color: #fff;
        text-transform: uppercase;
        text-align: center;
        font-size: 12px;
        font-weight: 900;
        width: 130px;
        height: 40px;
        vertical-align: top;
        transition: background-color .28s cubic-bezier(.4,0,.2,1);
        border: none;
        margin: 10px 0 0; 
        &[disabled] {
            background-color: $gray;
            cursor: not-allowed;
        }
    }
</style>
<div class:isOpen class="form-wrapper">
        <form>
            <fieldset>
                <legend>Select {plural(section)}:</legend>
                {#each data as datum, i}
                <label on:keydown="{keydownHandler}" tabindex="0" bind:this="{labels[i]}" data-key="{datum.key}" title="{datum.display}"><input tabindex="-1" on:change="{changeHandler}" name="{datum.key}" type="checkbox" /> {datum.display}</label>
                {/each}
            </fieldset>
        </form>
        <div class="input-wrapper">
            <input disabled="{!isDirty}" on:click|preventDefault="{formSubmit}" type="submit" value="Apply changes" />
        </div>
        <div class="x-out-wrapper" on:click|preventDefault="{closeHandler}">
            <XOut ariaLabel="Close {dictionary[section].display} filter options" />
        </div>
</div>
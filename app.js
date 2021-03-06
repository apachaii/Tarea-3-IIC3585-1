// Webasembly -----------------------------------------------------------------------

const find_best_algorithms = {}
Module.onRuntimeInitialized = async _ => {
    find_best_algorithms.fast = Module.cwrap(
        'c_algorithm_fast', null, ['number', 'number']
    );
    find_best_algorithms.complete = Module.cwrap(
        'c_algorithm_complete', null, ['number', 'number']
    );
};

function execute_algorithm(find_best, set_length) {

    // Create example data to test
    let data = new Uint32Array(set_length);

    // Get data byte size, allocate memory on Emscripten heap, and get pointer
    let nDataBytes = data.length * data.BYTES_PER_ELEMENT;
    //Module.TOTAL_MEMORY = nDataBytes; // added by jo
    let dataPtr = Module._malloc(nDataBytes);

    // Copy data to Emscripten heap (directly accessed from Module.HEAPU8)
    let dataHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, nDataBytes);
    dataHeap.set(new Uint8Array(data.buffer));

    // Call function and get result
    find_best(dataHeap.byteOffset, set_length);
    let best_found = new Uint32Array(dataHeap.buffer, dataHeap.byteOffset, data.length);

    // Free memory
    Module._free(dataHeap.byteOffset);

    return best_found;
}

// C algorithm -----------------------------------------------------------------------


function c_algorithm_fast(set_length) {
    return execute_algorithm(find_best_algorithms.fast, set_length);
}


function c_algorithm_complete(set_length) {
    return execute_algorithm(find_best_algorithms.complete, set_length)
}

// C algorithm call -----------------------------------------------------------------------

let type_of;

let startTime = 0, endTime = 0, time = 0;

function fast_or_complete(value_type) {
    type_of = value_type
    return type_of
}

function switch_to_html_c(set_length, function_value, time_of_function, type_of_value) {
    document.getElementById("console-content").innerText = `$ Wasm/${type_of_value} (${set_length}): ${function_value}`
    document.getElementById(`${set_length}-c`).innerText = `Tiempo en Wasm: ${time_of_function.toFixed(4)}`

}

function time_and_change_c(function_of, set_length, type_of_value) {
    startTime = performance.now();
    let func_execute_algorithm_complete = function_of(set_length);
    endTime = performance.now();
    time = (endTime - startTime) / 1000;
    switch_to_html_c(set_length, func_execute_algorithm_complete, time, type_of_value);
}

function call_c_algorithm(set_length) {
    type_of === true
        ? time_and_change_c(c_algorithm_complete, set_length, "complete")
        : time_and_change_c(c_algorithm_fast, set_length, "fast");
}


// JS algorithm call -----------------------------------------------------------------------

function switch_to_html_js(set_length,function_value,time_of_function,type_of_value){
    document.getElementById("console-content").innerText = `$ Js/${type_of_value} (${set_length}): ${function_value}`
    document.getElementById(`${set_length}-js`).innerText = `Tiempo en js: ${time_of_function.toFixed(4)}`
}

function time_and_change_js(function_of,set_length,type_of_value,bool){
    startTime = performance.now();
    let func_execute_algorithm_complete = function_of(set_length,bool);
    endTime = performance.now();
    time = (endTime - startTime)/1000;
    switch_to_html_js(set_length,func_execute_algorithm_complete,time,type_of_value)  ;
}

async function call_javascript_algorithm(set_length){
    type_of === true
        ? time_and_change_js(javascript_algorithm_complete,set_length,"complete",false)
        : time_and_change_js(javascript_algorithm_fast,set_length,"fast",true);
}
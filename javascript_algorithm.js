// Taken from here https://gist.github.com/customcommander/c1841e09c3be1e806e36#file-intersection-js
function there_is_intersection(a, b) {
    let x = 0,
        y = 0;
    while (x < a.length && y < b.length) {
        //intersection!
        if (a[x] === b[y]) {
            return true;
        } else if (a[x] < b[y]) {
            x++;
        } else {
            y++;
        }
    }
    return false;
}

// Taken from here https://stackoverflow.com/questions/18691627/how-to-merge-sorted-arrays-in-javascript
function mergeSorted(a, b) {
    let answer = new Array(a.length + b.length), i = 0, j = 0, k = 0;
    while (i < a.length && j < b.length) {
        if (a[i] < b[j]) {
            answer[k] = a[i];
            i++;
        } else {
            answer[k] = b[j];
            j++;
        }
        k++;
    }
    while (i < a.length) {
        answer[k] = a[i];
        i++;
        k++;
    }
    while (j < b.length) {
        answer[k] = b[j];
        j++;
        k++;
    }
    return answer;
}

const mergeAll = (...arrays) => arrays.reduce(mergeSorted);

function removeSorted(a, b) {
    let answer = new Array(a.length - b.length), i = 0, j = 0, k = 0;
    while (i < a.length && j < b.length) {
        if (a[i] === b[j]) {
            i++;
            j++;
        } else if (a[i] < b[j]) {
            answer[k] = a[i];
            i++;
            k++;
        } else {
            j++;
        }
    }
    while (i < a.length) {
        answer[k] = a[i];
        i++;
        k++;
    }
    return answer;
}

const removeAll = (...arrays) => arrays.reduce(removeSorted);

function check_new_number_compatibility(
    total_sums,
    total_multiplications,
    total_differences,
    new_sums,
    new_multiplications,
    new_differences,
) {
    // Intersections between new sums and total sums are unnecessary due to manage difference
    return !there_is_intersection(new_sums, new_multiplications) &&
        !there_is_intersection(total_multiplications, new_sums) &&
        !there_is_intersection(total_multiplications, new_multiplications) &&
        !there_is_intersection(total_sums, new_multiplications) &&
        !there_is_intersection(total_differences, new_differences);
}


// find_lower_bound_difference inputs the position of the set and the already used differences.
// It calculates a lower bound.
// Assumes that de differences are sorted.
// It uses this:
// As the differences between 2 elements of the set can not be equal to any other difference, then
// a set of length n has to be at least the sum of 1,...,n.
// of the element in the position the set.
function find_lower_bound_difference(position_in_set, used_differences = []) {
    // create the structures to keep the sum of the differences
    let sum_of_differences = 0;

    // amount of used differences starts at the amount of space in-between
    let counted_differences_amount = position_in_set;

    // from the first difference until amount of used differences (or the length of the used differences)
    for (
        let difference_i = 0;
        difference_i < Math.min(counted_differences_amount, used_differences.length);
        difference_i++
    ) {
        const current_difference = used_differences[difference_i];

        // if the difference is lower or equal than the amount of used differences
        if (current_difference <= counted_differences_amount) {

            // increase the amount of used differences by 1
            counted_differences_amount++;

            // add the current difference to the sum of differences
            sum_of_differences += current_difference;
        }
        // else break from the loop
        else {
            break;
        }
    }

    // the original lower bound if the amount of differences=n : n*(n+1)/2
    const original_lowe_bound = counted_differences_amount * (counted_differences_amount + 1) / 2;

    // the final lower bound is the original subtracted the sums of differences
    return original_lowe_bound - sum_of_differences;
}

class Product_Store {
    constructor(sums, multiplication, differences_report, lower_bound) {
        this.sums = sums;
        this.multiplication = multiplication;
        this.differences_report = differences_report;
        this.lower_bound = lower_bound;
    }
}

class difference_report {
    constructor(differences, previous_first_gap = 0) {
        this.differences = differences;

        // where in the differences there is a gap between the current value, and the
        // next value. If is -1 then the differences doesn't start with 0
        this.first_gap = null;

        this.find_first_gap(previous_first_gap);

        this.current_difference = null;
    }

    find_first_gap(previous_gap) {
        // if there are no differences or the first difference isn't 1 then the first gap is -1;
        const current_length = this.differences.length;
        if (current_length === 0 || this.differences[0] !== 1) {
            this.gap = -1;
            this.first_gap = -1;
            return;
        }

        this.gap = previous_gap === -1 ? 0 : previous_gap;
        this.find_next_gap(true);
        this.first_gap = this.gap
    }

    find_next_gap(inclusive = false) {
        const current_length = this.differences.length;
        const find_start = this.gap + (inclusive ? 0 : 1)
        for (let difference_i = find_start; difference_i < current_length - 1; difference_i++) {

            // if the current difference isn't continue with the next then is the current first gap
            const current_difference = this.differences[difference_i];
            const next_difference = this.differences[difference_i + 1];
            if (current_difference + 1 !== next_difference) {
                this.gap = difference_i;
                return;
            }
        }

        // if were all continuous then the first gap is the amount of the differences
        this.gap = current_length - 1;
    }

    find_next_available_difference() {
        // if a current difference does not exist start it
        if (!this.current_difference) {

            // if there are no gaps then starts at 1
            if (this.gap === -1) {
                this.current_difference = 1;
            }

            // if the gap is between 1 and the amount of difference
            else if (this.gap < this.differences.length - 1) {
                // start it at the start of the gap +1
                this.current_difference = this.differences[this.gap] + 1;
            }

            // else start at the end of differences +1
            else {
                this.current_difference = this.differences.slice(-1)[0] + 1;
            }
        }
        // else exist
        else {

            // increase the current difference by 1
            this.current_difference++;

            // if the gap is not the final
            if (this.gap !== this.differences.length - 1) {

                // if reach the end of the gap
                if (this.current_difference === this.differences[this.gap + 1]) {

                    // get the next gap
                    this.find_next_gap();

                    // if is the last one then the difference is the last one +1
                    if (this.gap === this.differences.length - 1) {
                        this.current_difference = this.differences.slice(-1)[0] + 1;
                    }

                    // else is the start of the gap +1
                    else {
                        this.current_difference = this.differences[this.gap] + 1;
                    }
                }
            }
        }

        // return the difference
        return this.current_difference;
    }
}

// find_possible_set inputs a the end of a possible set which is assume is correct,
// the sums generated by of that end, the multiplications generated by of that end,
// the differences between each element of the set, and the length to which expand the set.
// It creates a set of that length with that end if is possible.
function find_possible_set(set_end, end_sums, end_multiplications, end_differences, final_length) {

    // create the structures to store the new possibility, sums, multiplications, and differences
    const searched_length = final_length - set_end.length;
    const searched_set = Array(searched_length);

    let total_sums = [...end_sums];
    let total_multiplications = [...end_multiplications];
    let total_differences = [...end_differences];

    // create the structures to store the sums, multiplications and differences added en each element
    const stored_products = Array(searched_length);

    // the first number searched is the lower number in the end - the lowest difference
    let current_difference_report = new difference_report(total_differences);
    let current_difference = current_difference_report.find_next_available_difference();

    let previous_number = set_end[0];
    let searched_number = previous_number - current_difference;

    // get the starting lower bound
    let lower_bound = find_lower_bound_difference(searched_length - 1, total_differences);

    // while an structure wasn't found
    let searched_index = searched_length - 1;
    while (searched_index >= 0) {

        // console.log(`index: ${searched_index}, number: ${searched_number}`);

        // if the number is lower than the lower bound and is the first searched
        const is_less_than_lower_bound = searched_number < 1 + lower_bound;
        if (is_less_than_lower_bound && searched_index === searched_length - 1) {

            // return is impossible order
            return null;
        }

        // if the number is lower than the lower bound
        if (is_less_than_lower_bound) {

            // remove the previous one from the sums, multiplications and differences
            const previous_index = searched_index + 1;
            const previous_products_store = stored_products[previous_index];

            total_sums = removeAll(total_sums, previous_products_store.sums);
            total_multiplications = removeAll(total_multiplications, previous_products_store.multiplication);

            current_difference_report = previous_products_store.differences_report
            total_differences = current_difference_report.differences;

            // replace the lower bound by the previous one
            lower_bound = previous_products_store.lower_bound;

            // start searching from the previous one
            searched_index = previous_index;
            if (searched_index === searched_length - 1) {
                previous_number = set_end[0];
            } else {
                previous_number = searched_set[searched_index + 1];
            }
            current_difference = current_difference_report.find_next_available_difference()
            searched_number = previous_number - current_difference;
        }

        // if the number is 2 then it doesn't work
        else if (searched_number === 2) {

            // decrease the searched number by the lowest possible difference
            current_difference = current_difference_report.find_next_available_difference();
            searched_number = previous_number - current_difference;
        }

        // else process the number
        else {

            // if the number is compatible
            const current_result = [searched_number, ...searched_set.slice(searched_index + 1), ...set_end];

            const sums = current_result.map(number => number + searched_number);
            const multiplications = current_result.map(number => number * searched_number);
            const differences = current_result.slice(1).map(number => number - searched_number);

            const is_valid = check_new_number_compatibility(
                total_sums,
                total_multiplications,
                total_differences,
                sums,
                multiplications,
                differences,
            );

            if (is_valid) {

                // add the number to the possible set
                searched_set[searched_index] = searched_number;

                // add the sums, multiplications and differences
                total_sums = mergeAll(total_sums, sums);
                total_multiplications = mergeAll(total_multiplications, multiplications);
                total_differences = mergeAll(total_differences, differences);

                stored_products[searched_index] = new Product_Store(sums, multiplications, current_difference_report, lower_bound);
                current_difference_report = new difference_report(total_differences, current_difference_report.first_gap);

                // pass to the next number in the set
                searched_index--;
                previous_number = searched_number;

                // set the new lower bound
                lower_bound = find_lower_bound_difference(searched_index, total_differences);
            }

            // decrease the searched number by the lowest possible difference
            current_difference = current_difference_report.find_next_available_difference();
            searched_number = previous_number - current_difference;
        }
    }

    // return the found set
    return searched_set;
}

// find_best_set inputs the length of the set and outputs the
// best set, the one with the lower highest number for that length
function find_best_set(set_length, only_first = true) {

    // create the structures to contain the set and the products
    const searched_set = Array(set_length);
    let searched_sums = [];
    let searched_multiplications = [];
    let searched_differences = [];

    // for every element to be filled in the set (more to less order)
    for (let element_i = set_length - 1; element_i >= 0; element_i--) {

        // the starting number to search is the lower bound for the place
        let search_number = 1 + find_lower_bound_difference(element_i, searched_differences);

        // while the lower element haven't been found
        while (!searched_set[element_i]) {

            // try the current number
            const current_set = [search_number, ...searched_set.slice(element_i + 1)];

            const sums = current_set.map(number => number + search_number);
            const multiplications = current_set.map(number => number * search_number);
            const differences = current_set.slice(1).map(number => number - search_number);

            const is_incompatible = !check_new_number_compatibility(
                searched_sums,
                searched_multiplications,
                searched_differences,
                sums,
                multiplications,
                differences,
            );

            if (is_incompatible) {
                search_number++;
                continue;
            }

            const current_sums = mergeAll(sums, searched_sums);
            const current_multiplications = mergeAll(multiplications, searched_multiplications);
            const current_differences = mergeAll(differences, searched_differences);


            const found_set = find_possible_set(
                current_set,
                current_sums,
                current_multiplications,
                current_differences,
                set_length
            );

            // if it works
            if (found_set) {

                if (only_first) {
                    return [...found_set, search_number];
                }

                // add the number to the set
                searched_set[element_i] = search_number;

                // add the sums and multiplications to the products
                searched_sums = current_sums;
                searched_multiplications = current_multiplications;
                searched_differences = current_differences;

                // continue to the next number
            }

            // else increase the number of the search
            search_number++;
        }
    }

    // return the set
    return searched_set;
}


// Here on is for testing
function find_duplicate_in_array(arra1) {
    let object = {};
    let result = [];

    arra1.forEach(function (item) {
        if (!object[item])
            object[item] = 0;
        object[item] += 1;
    })

    for (let prop in object) {
        if (object[prop] >= 2) {
            result.push(prop);
        }
    }

    return result;
}

function is_set_correct(tested_set) {
    let s = [];
    let m = [];
    for (let i = 0; i < tested_set.length; i++) {

        for (let j = i; j < tested_set.length; j++) {
            const one = tested_set[i];
            const two = tested_set[j];

            s.push(one + two);
            m.push(one * two);
        }
        s.sort((a, b) => a - b)
        m.sort((a, b) => a - b);
    }
    const duplicates = find_duplicate_in_array(mergeAll(s, m))
    return duplicates.length === 0;
}

// const cosa1=find_best_set(11);
/*const cosa1=[ 3, 5, 8, 9 ];
console.log(cosa1);

let s = [];
let m = [];
for (let i = 0; i < cosa1.length; i++) {

    for (let j = i; j < cosa1.length; j++) {
        const one = cosa1[i];
        const two = cosa1[j];

        s.push(one+two);
        m.push(one*two);
    }
    s.sort((a,b)=>a-b)
    m.sort((a,b)=>a-b);
}
console.log(find_duplicate_in_array(mergeAll(s,m)));
*/


/*
console.time('someFunction')

for (let i = 1; i <= 10; i++) {
    console.log(find_best_set(i));
}

console.timeEnd('someFunction')*/

/*for (let i = 30; i <= 50; i++) {
    console.log(find_possible_set([i],[i*2],[i*i],[],8));
}*/

/*
console.time('someFunction')

for (let i = 1; i <= 10; i++) {
    console.log(find_best_set(i));
}

console.timeEnd('someFunction')
*/
/*console.time('someFunction')

for (let i = 1; i <= 10; i++) {
    console.log(find_best_set(i, false));
}

console.timeEnd('someFunction')


console.time('someFunction');

*/
/*
for (let j = 1; j <= 10; j++) {
    const lower = find_lower_bound_difference(j-1);
    console.log("\n", j, lower)
    for (let i = lower; i <= 100; i++) {
        const found_set = find_possible_set([i], [i * 2], [i * i], [], j)

        if (found_set) {
            const it_works = is_set_correct([...found_set, i]);
            console.log([...found_set, i], j, i, it_works);
        } else {
            console.log(found_set, j, i);
        }
    }
}
*/
/*
let g = 0
function brute_Force_recursive(max_lenght, index, prev) {
    if (index == 0){
        return prev;
    }
    for (let i = prev[index]-1; i > 0; i--) {
        g++
        const current_set = [...prev];
        current_set[index-1]=i;
        // console.log(current_set);
        const set_part = current_set.slice(index-1);
        const set_correctness = is_set_correct(set_part);
        if (set_correctness){
            const next_set = brute_Force_recursive(max_lenght,index-1,current_set);
            if (next_set){
                return next_set;
            }
        }
    }
    return null;
}

let a = brute_Force_recursive(8,7,[ 0, 0, 0, 0, 0, 0, 0, 38 ])
console.log(a);
*/
/*
const tested_set = [109];
let s = [];
let m = [];
let d = []
for (let i = 0; i < tested_set.length; i++) {

    for (let j = i; j < tested_set.length; j++) {
        const one = tested_set[i];
        const two = tested_set[j];
        if (j !== i){
            d.push(two-one);
        }

        s.push(one + two);
        m.push(one * two);
    }
    s.sort((a, b) => a - b);
    m.sort((a, b) => a - b);
    d.sort((a, b) => a - b);
}

console.log(find_best_set(12, false));
const found_set = find_possible_set(tested_set, s, m, d, 12);
console.log([...found_set, ...tested_set]);
*/

/*for (let i = 1; i <= 10; i++) {
    console.log(find_best_set(i, false));
}*/

//console.log(find_possible_set([31, 32],[31*2, 31+32, 32*2],[31*31, 31*32, 32*32],[1],7));

function javascript_algorithm_fast(set_length) {
    best_found = find_best_set(set_length,true);
    console.log("JS",best_found);
    return best_found;
}

function javascript_algorithm_complete(set_length) {
    best_found = find_best_set(set_length,false);
    console.log("JS",est_found);
    return best_found;
}
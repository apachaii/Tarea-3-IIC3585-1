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
        }else {
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
        if (a[i] === b[j]){
            i++;
            j++;
        }
        if (a[i] < b[j]) {
            answer[k] = a[i];
            i++;
            k++;
        }else {
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

// check_new_number_compatibility inputs the current products, the sums and multiplication
// made with the new number. Outputs if is valid add the new number to the searched ones
function check_new_number_compatibility(
    current_products,
    sums,
    multiplications,
) {
    // if there is an intersection between the new sums and the new multiplications or,
    // between each of those and the current products
    return !there_is_intersection(sums, multiplications) &&
        !there_is_intersection(current_products, sums) &&
        !there_is_intersection(current_products, multiplications);
}

//find_upper_bound_possibility inputs the length of the set, and output a set of that length meant
//to be used as upper bound with the highest number, and to find sets with lower ones.
function find_upper_bound_possibility(set_length) {

    //create the set and the structures to store the sums and multiplications
    const searched = Array();
    let products = Array();

    //for every element to be filled in the set
    for (let set_i = 0; set_i < set_length; set_i++) {

        //try fill that element with a number (starting with the lowest)
        let current_number = 1;
        if (set_i !== 0) {
            current_number = searched[set_i - 1];
        }
        let have_number_been_found = false;
        while (!have_number_been_found) {

            //if the number is compatible the previous ones element
            const sums = [...searched, current_number].map(number => number + current_number);
            const multiplications = [...searched, current_number].map(number => number * current_number);

            const is_valid = check_new_number_compatibility(products, sums, multiplications);

            if (is_valid) {
                //add it to the set
                searched.push(current_number);

                //add the sums and multiplication to the structures
                products = mergeAll(sums , multiplications, products);

                have_number_been_found = true;
            }
            //else continue the next higher number
            else {
                current_number++;
            }
        }
    }

    return searched;
}

// find_lower_bound inputs the length of the set and tries to approximate a lower bound, it can't be lower than
// the approximation
function find_lower_bound(length){
    // best found is n*(n+1)/1
    return (length*(length+1))/2;
}

class Product_Store {
    constructor(sums, multiplication) {
        this.sums = sums;
        this.multiplication = multiplication
    }
}

// find_possible_set inputs a the end of a possible set, the product of that end,
// and the length to which expand the set. Create a set of that length with that end
// if is possible.
// Assumes that the set_end and end_products are ordered from lower to higher
function find_possible_set(set_end, end_products, final_length){

    // create the structures to store the new possibility and products
    const searched_length = final_length-set_end.length
    const searched = Array(searched_length);
    let products = [...end_products];

    // create the structures to store the products added en each element
    const stored_products = Array(searched_length);

    // the first number searched is the lower number in the end -1
    let searched_number = set_end[0]-1;

    // while an structure wasn't found
    let searched_index = searched_length-1;
    while (searched_index >= 0){

        // if the number is lower than the lower bound and is the first searched
        const less_than_lower_bound = searched_number<find_lower_bound(searched_index+1);
        if (less_than_lower_bound && searched_index === searched_length-1) {

            // return is impossible order
            return null;
        }

        // if the number is lower than the lower bound
        if (less_than_lower_bound) {

            // remove the previous one from the products
            const previous_index = searched_index+1;
            const previous_products_store = stored_products[previous_index];
            const previous_products = mergeAll(
                previous_products_store.sums,
                previous_products_store.multiplication,
                );
            products = removeAll(products, previous_products)

            // set searched number to the previous one -1
            searched_number = searched[previous_index]-1;

            // start searching from the previous one
            searched_index = previous_index;
        }

        // if the number is compatible
        const current_result = [searched_number, ...searched.slice(searched_index+1), ...set_end];

        const sums = current_result.map(number => number + searched_number);
        const multiplications = current_result.map(number => number * searched_number);

        const is_valid = check_new_number_compatibility(products, sums, multiplications);

        if (is_valid){
            // add the number to the possible set
            searched[searched_index] = searched_number;

            // add the products
            products = mergeAll(products, sums, multiplications);
            stored_products[searched_index] = new Product_Store(sums, multiplications);

            // pass to the next number in the set
            searched_index--;
        }

        // decrease the searched number
        searched_number--;
    }

    // return the found set
    return searched;
}

// find_best_set inputs the length of the set and outputs the
// best set, the one with the lower highest number for that length
function find_best_set(set_length) {

    // create the structures to contain the set and the products
    const searched_set = Array(set_length);
    let searched_products = [];

    // for every element to be filled in the set (more to less order)
    for (let element_i = set_length-1; element_i >= 0; element_i--) {

        // the starting number to search is the lower bound for the place
        let search_number = find_lower_bound(element_i+1)

        // while the lower element haven't been found
        let hast_current_number_been_found = false;
        while (!hast_current_number_been_found){

            // try the current number
            const current_set = [search_number,...searched_set.slice(element_i+1)];

            const sums = current_set.map(number => number + search_number);
            const multiplications = current_set.map(number => number * search_number);
            const current_products = mergeAll(sums, multiplications, searched_products);

            const found_set = find_possible_set(current_set,current_products,set_length)

            // if it works
            if (found_set){

                // add the number to the set
                searched_set[element_i] = search_number;

                // add the sums and multiplications to the products
                searched_products = current_products

                // continue to the next number
                hast_current_number_been_found = true;
            }

            // else increase the number of the search
            search_number++;
        }
    }

    // return the set
    return searched_set;
}

console.log(find_best_set(10));
console.log([...find_possible_set([84],[84*2,84*84],10),84]);
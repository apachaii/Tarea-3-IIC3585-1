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
            const multiplication = [...searched, current_number].map(number => number * current_number);

            const is_valid = check_new_number_compatibility(products, sums, multiplication);

            if (is_valid) {
                //add it to the set
                searched.push(current_number);

                //add the sums and multiplication to the structures
                products = mergeAll(sums , multiplication, products);

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


console.log(find_upper_bound_possibility(5));

//
// Created by pablo on 24-04-20.
//
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <inttypes.h>

#define FREE(pointer) do{free(pointer); pointer = NULL;}while(0)

// Taken from here https://www.geeksforgeeks.org/union-and-intersection-of-two-sorted-arrays-2/
bool there_is_intersection(
        const uint_fast32_t arr1[],
        const uint_fast32_t arr2[],
        uint_fast32_t len1,
        uint_fast32_t len2)
{
    int i = 0, j = 0;
    while (i < len1 && j < len2)
    {
        if (arr1[i] < arr2[j])
            i++;
        else if (arr2[j] < arr1[i])
            j++;
        else /* if arr1[i] == arr2[j] */
        {
            return true;
        }
    }
    return false;
}


// Taken from here https://www.geeksforgeeks.org/merge-two-sorted-arrays/
void mergeArrays(const uint_fast32_t arr1[], const uint_fast32_t arr2[], uint_fast32_t len1,
                 uint_fast32_t len2, uint_fast32_t arr3[])
{
    uint_fast32_t i = 0, j = 0, k = 0;

    // Traverse both array
    while (i < len1 && j < len2)
    {
        // Check if current element of first
        // array is smaller than current element
        // of second array. If yes, store first
        // array element and increment first array
        // index. Otherwise do same with second array
        if (arr1[i] < arr2[j])
            arr3[k++] = arr1[i++];
        else
            arr3[k++] = arr2[j++];
    }

    // Store remaining elements of first array
    while (i < len1)
        arr3[k++] = arr1[i++];

    // Store remaining elements of second array
    while (j <len2)
        arr3[k++] = arr2[j++];
}

bool check_new_number_compatibility(
        const uint_fast32_t *total_sums,
        const uint_fast32_t *total_multiplications,
        const uint_fast32_t *total_differences,

        const uint_fast32_t total_amount_of_products,
        const uint_fast32_t total_amount_of_differences,

        const uint_fast32_t *new_sums,
        const uint_fast32_t *new_multiplications,
        const uint_fast32_t *new_differences,

        const uint_fast32_t new_amount_of_products,
        const uint_fast32_t new_amount_of_differences
) {
    return !there_is_intersection
            (new_sums, new_multiplications, new_amount_of_products, new_amount_of_products) &&
           !there_is_intersection(total_multiplications, new_sums, total_amount_of_products, new_amount_of_products) &&
           !there_is_intersection(total_multiplications, new_multiplications, total_amount_of_products,
                                  new_amount_of_products) &&
           !there_is_intersection(total_sums, new_multiplications, total_amount_of_products, new_amount_of_products) &&
           !there_is_intersection(total_differences, new_differences, total_amount_of_differences,
                                  new_amount_of_differences);
}


void copy_array(
        const uint_fast32_t* original_array,
        uint_fast32_t* copied_into_array,
        const uint_fast32_t length
        ){
    for (uint_fast32_t array_i = 0; array_i < length; ++array_i) {
        const uint_fast32_t element_i = original_array[array_i];
        copied_into_array[array_i] = element_i;
    }
}

#define MIN(a,b) (((a)<(b))?(a):(b))

// find_lower_bound_difference inputs the position of the set and the already used differences.
// It calculates a lower bound.
// Assumes that de differences are sorted.
// It uses this:
// As the differences between 2 elements of the set can not be equal to any other difference, then
// a set of length n has to be at least the sum of 1,...,n.
// of the element in the position the set.
uint_fast32_t find_lower_bound_difference(
        const uint_fast32_t position_in_set,
        const uint_fast32_t* used_differences,
        const uint_fast32_t differences_length) {

    // create the structures to keep the sum of the differences
    uint_fast32_t sum_of_differences = 0;

    // amount of used differences starts at the amount of space in-between
    uint_fast32_t counted_differences_amount = position_in_set;

    // from the first difference until amount of used differences (or the length of the used differences)
    for (uint_fast32_t difference_i = 0;
        difference_i < MIN(counted_differences_amount, differences_length);
        difference_i++
    ) {
        const uint_fast32_t current_difference = used_differences[difference_i];

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
    const uint_fast32_t original_lowe_bound =
            counted_differences_amount * (counted_differences_amount + 1) / 2;

    // the final lower bound is the original subtracted the sums of differences
    return original_lowe_bound - sum_of_differences;
}

typedef struct possible_set_report{
    bool possible_set_found;
    uint_fast32_t* possible_set;
} possible_set_report;

typedef struct difference_report{
    uint_fast32_t* differences;
    uint_fast32_t differences_length;

    uint_fast32_t first_gap;
    uint_fast32_t gap;
    bool there_is_gap;

    uint_fast32_t current_difference;
    bool difference_found;

} difference_report;

void find_next_gap(difference_report* current_report, bool inclusive) {
    const uint_fast32_t current_length = current_report->differences_length;
    const uint_fast32_t find_start = current_report->gap + (inclusive ? 0 : 1);
    for (uint_fast32_t difference_i = find_start; difference_i < current_length - 1; ++difference_i) {

        // if the current difference isn't continue with the next then is the current first gap
        const uint_fast32_t current_difference = current_report->differences[difference_i];
        const uint_fast32_t next_difference = current_report->differences[difference_i + 1];
        if (current_difference + 1 != next_difference) {
            current_report->gap = difference_i;
            return;
        }
    }

    // if were all continuous then the first gap is the amount of the differences
    current_report->gap = current_length - 1;
}

void find_first_gap(
        difference_report* current_report,
        bool there_is_previous_gap,
        uint_fast32_t previous_gap
        ){
    const uint_fast32_t current_length = current_report->differences_length;
    if (current_length == 0 || current_report->differences[0] != 1) {
        current_report->there_is_gap = false;
    } else {
        current_report->there_is_gap = true;
        current_report->gap = there_is_previous_gap ? previous_gap : 0;
        find_next_gap(current_report, true);
        current_report->first_gap = current_report->gap;
    }
}

uint_fast32_t find_next_available_difference(difference_report* current_report) {

    // if a current difference does not exist start it
    if (!current_report->difference_found) {

        // if there are no gaps then starts at 1
        if (!current_report->there_is_gap) {
            current_report->current_difference = 1;
        }

        // if the gap is between 1 and the amount of difference
        else if (current_report->gap < current_report->differences_length - 1) {
            // start it at the start of the gap +1
            current_report->current_difference =
                    current_report->differences[current_report->gap] + 1;
        }

        // else start at the end of differences +1
        else {
            current_report->current_difference =
                    current_report->differences[current_report->differences_length-1] + 1;
        }

        current_report->difference_found = true;
    }

    // else exist
    else {

        // increase the current difference by 1
        current_report->current_difference++;

        // if the gap is not the final
        if (current_report->differences_length > 0 &&
            current_report->gap != current_report->differences_length - 1) {

            // if reach the end of the gap
            if (current_report->current_difference==
                current_report->differences[current_report->gap + 1]) {

                // get the next gap
                find_next_gap(current_report, false);

                // if is the last one then the difference is the last one +1
                if (current_report->gap != current_report->differences_length - 1) {
                    current_report->current_difference =
                            current_report->differences[current_report->differences_length-1] + 1;
                }

                // else is the start of the gap +1
                else {
                    current_report->current_difference =
                            current_report->differences[current_report->gap] + 1;
                }
            }
        }
    }

    // return the difference
    return current_report->current_difference;
}

typedef struct product_store{
    uint_fast32_t* sums;
    uint_fast32_t* multiplications;
    difference_report differences;
    uint_fast32_t lower_bound;
} product_store;

static inline void free_stored_products(product_store* stored_products, const uint_fast16_t store_length){
    for (int store_i = 0; store_i < store_length; ++store_i) {
        product_store *current_store = &stored_products[store_i];
        FREE(current_store->sums);
        FREE(current_store->multiplications);
        FREE(current_store->differences.differences);
    }
    FREE(stored_products);
}

// find_possible_set inputs a the end of a possible set which is assume is correct,
// the sums generated by of that end, the multiplications generated by of that end,
// the differences between each element of the set, and the length to which expand the set.
// It creates a set of that length with that end if is possible.
void find_possible_set(
        possible_set_report report,
        const uint_fast16_t *set_end,
        uint_fast32_t *end_sums,
        uint_fast32_t *end_multiplications,
        uint_fast32_t *end_differences,
        uint_fast16_t end_length,
        uint_fast16_t final_length
) {
    report.possible_set_found = false;

    // create the structures to store the new possibility, sums, multiplications, and differences
    const uint_fast16_t searched_length = final_length - end_length;
    uint_fast16_t searched_set[searched_length];

    uint_fast32_t product_length[searched_length];
    uint_fast32_t differences_length[searched_length];
    for (uint_fast32_t length_i = 0; length_i < searched_length; ++length_i) {
        const uint_fast32_t difference_i = final_length - length_i - 1;
        product_length[length_i] = difference_i * (difference_i + 1) / 2;
        differences_length[length_i] = difference_i * (difference_i - 1) / 2;
    }

    const uint_fast32_t final_product_length = product_length[0];
    uint_fast32_t total_sums[final_product_length];
    uint_fast32_t total_multiplications[final_product_length];
    {
        const uint_fast32_t starting_product_length = product_length[searched_length - 1];
        copy_array(end_sums, total_sums, starting_product_length);
        copy_array(end_multiplications, total_multiplications, starting_product_length);
    }

    const uint_fast32_t final_differences_length = differences_length[0];
    uint_fast32_t total_differences[final_differences_length];
    {
        const uint_fast32_t start_differences_length = differences_length[searched_length - 1];
        copy_array(end_differences, total_differences, start_differences_length);
    }

    // create the structures to store the sums, multiplications and differences added en each element
    product_store* stored_products = calloc(searched_length, sizeof(product_store));
    for (uint_fast16_t store_i = 0; store_i < searched_length; ++store_i) {

        product_store *current_store = &stored_products[store_i];

        uint_fast32_t current_product_length = final_length-store_i;
        uint_fast32_t* sums = malloc(current_product_length*sizeof(uint_fast32_t));
        uint_fast32_t* multiplications = malloc(current_product_length*sizeof(uint_fast32_t));

        uint_fast32_t current_difference_length = final_length-store_i-1;
        uint_fast32_t* differences = malloc(current_difference_length*sizeof(uint_fast32_t));

        current_store->sums=sums;
        current_store->multiplications=multiplications;
        current_store->differences.differences = differences;
        current_store->differences.differences_length=differences_length[store_i];
        current_store->differences.difference_found = false;
    }

    // the first number searched is the lower number in the end - the lowest difference
    difference_report* current_difference_report = &stored_products[searched_length-1].differences;
    find_first_gap(current_difference_report,false,0);
    uint_fast32_t current_difference = find_next_available_difference(current_difference_report);

    uint_fast32_t previous_number = set_end[0];
    uint_fast32_t searched_number = previous_number - current_difference;

    // get the starting lower bound
    uint_fast32_t lower_bound = find_lower_bound_difference(
            searched_length - 1,
            total_differences,
            final_differences_length);

    // while an structure wasn't found
    int_fast64_t searched_index = searched_length - 1;
    while (searched_index >= 0) {

        // if the number is lower than the lower bound and is the first searched
        const bool is_less_than_lower_bound = searched_number < 1 + lower_bound;
        if(is_less_than_lower_bound && searched_index == searched_length - 1){

            // return is impossible order
            free_stored_products(stored_products,searched_length);
            return;
        }

        // if the number is lower than the lower bound
            // remove the previous one from the sums, multiplications and differences
            // replace the lower bound by the previous one
            // start searching from the previous one

        // if the number is 2 then it doesn't work
        else if (searched_number == 2) {

            // decrease the searched number by the lowest possible difference
            current_difference = find_next_available_difference(current_difference_report);
            searched_number = previous_number - current_difference;
        }

        // else process the number
        else {

            // if the number is compatible
            uint_fast32_t current_result_length = final_length - searched_index;
            uint_fast32_t current_result[current_result_length];
            {
                current_result[0] = searched_number;
                for (uint_fast32_t result_i = searched_index; result_i < searched_length - 1; ++result_i) {
                    uint_fast32_t result_element = searched_set[result_i];
                    current_result[result_i - searched_index + 1] = result_element;
                }
                const uint_fast32_t current_result_index = 1 + (searched_length - 1 - searched_index);
                for (uint_fast32_t end_i = 0; end_i < end_length; ++end_i) {
                    uint_fast32_t current_end_element = set_end[end_i];
                    current_result[current_result_index + end_i] = current_end_element;
                }
            }

            uint_fast32_t sums[current_result_length];
            uint_fast32_t multiplication[current_result_length];
            uint_fast32_t differences[current_result_length-1];
            {
                for (uint_fast32_t result_i = 0; result_i < current_result_length; ++result_i) {
                    const uint_fast32_t result_element = current_result[result_i];
                    sums[result_i] = result_element + searched_number;
                    multiplication[result_i] = result_element * searched_number;
                }
                for (uint_fast32_t result_i = 1; result_i < current_result_length; ++result_i) {
                    const uint_fast32_t result_element = current_result[result_i];
                    differences[result_i - 1] = result_element - searched_number;
                }
            }

            const uint_fast32_t found_product_length = product_length[searched_index];
            const uint_fast32_t found_difference_length = differences_length[searched_index];
            const bool is_valid = check_new_number_compatibility(
                    total_sums,
                    total_multiplications,
                    total_differences,
                    found_product_length,
                    found_difference_length,
                    sums,
                    multiplication,
                    differences,
                    current_result_length,
                    current_result_length-1
            );

            if (is_valid) {

                // add the number to the possible set
                searched_set[searched_index] = searched_number;

                // add the sums, multiplications and differences
                {
                    uint_fast32_t found_sums[found_product_length];
                    copy_array(total_sums, found_sums, found_product_length);
                    mergeArrays(found_sums, sums, found_product_length, current_result_length, total_sums);

                    uint_fast32_t found_multiplications[found_product_length];
                    copy_array(total_multiplications, found_multiplications, found_product_length);
                    mergeArrays(found_multiplications, multiplication, found_product_length, current_result_length,
                                total_multiplications);

                    uint_fast32_t found_differences[found_difference_length];
                    copy_array(total_differences, found_differences, found_difference_length);
                    mergeArrays(found_differences, differences, found_difference_length, current_result_length - 1,
                                total_differences);
                }
                {
                    product_store *previous_store = &stored_products[searched_index];

                    copy_array(sums, previous_store->sums, current_result_length);
                    copy_array(multiplication, previous_store->multiplications, current_result_length);
                    previous_store->lower_bound = lower_bound;

                    if (searched_index - 1 >= 0){
                        product_store *next_store = &stored_products[searched_index - 1];
                        current_difference_report = &next_store->differences;
                    }
                }

                // pass to the next number in the set
                searched_index--;
                previous_number = searched_number;

                // set the new lower bound
                {
                    uint_fast32_t current_total_difference_length = differences_length[searched_index];
                    lower_bound = find_lower_bound_difference(searched_index, total_differences,
                                                              current_total_difference_length);
                }
            }

            // decrease the searched number by the lowest possible difference
            current_difference = find_next_available_difference(current_difference_report);
            searched_number = previous_number - current_difference;
        }
    }

    // return the found set
    free_stored_products(stored_products,searched_length);
}


// The final sets are 16 bits, the products are 32.
// the length of the arrays are 16 bits.

int main() {
    printf("Hello, World!\n");

    possible_set_report report = {
            .possible_set_found=false,
            .possible_set=(uint_fast16_t[5]) {0, 0, 0, 0, 0},
    };
    uint_fast16_t set_end[1] = {10};
    uint_fast32_t end_sums[1] = {20};
    uint_fast32_t end_multiplications[1] = {100};
    uint_fast32_t end_differences[0] = {};
    uint_fast16_t end_length = 1;
    uint_fast16_t final_length = 2;

    find_possible_set(
            report,
            set_end,
            end_sums,
            end_multiplications,
            end_differences,
            end_length,
            final_length
    );

    return 0;
}


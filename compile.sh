emcc -O2 c_algorithm.c -o main_algorithm.js -s EXTRA_EXPORTED_RUNTIME_METHODS=['ccall','cwrap'] -s ASSERTIONS=1 -s EXPORTED_FUNCTIONS="['_c_algorithm_fast','_c_algorithm_complete']"

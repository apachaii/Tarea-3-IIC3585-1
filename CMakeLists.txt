cmake_minimum_required(VERSION 3.16)
project(c_algorithm C)

set(CMAKE_C_STANDARD 99)

set(CMAKE_C_FLAGS_DEBUG "-Werror -g3 -O0")

message(STATUS "C flags, Debug configuration: ${CMAKE_C_FLAGS_DEBUG}")
message(STATUS "C flags, Release configuration: ${CMAKE_C_FLAGS_RELEASE}")
message(STATUS "C flags, Release configuration with Debug info: ${CMAKE_C_FLAGS_RELWITHDEBINFO}")
message(STATUS "C flags, minimal Release configuration : ${CMAKE_C_FLAGS_MINSIZEREL}")

add_executable(c_algorithm main.c)




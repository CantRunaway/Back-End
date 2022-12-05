"use strict";

// Example 1
//
// This example initialises a reader with a list of numbers. This is then piped to a transformer that filters the numbers.
// This is then piped to a reducer that uses a function to 'reduce' the stream of numbers to a single array containing the
// numbers. This array is then piped, as a string, to stdout.
var list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
	filterFunc = function(val) { if (val < 6) return val; },
	reducerFunc = function(val, acc) { acc.push(val); return acc; },
	ArrayStream = require("../index.js"),
	reader = ArrayStream.createReader(list),
	filter = ArrayStream.createTransformer(filterFunc),
	// Note that initialValue is an empty array. This array is repeatedly passed to the reducerFunc which pushes the object
	// to it and then returns it.
	reducer = ArrayStream.createReducer(reducerFunc, [], true);

reader.pipe(filter).pipe(reducer).pipe(process.stdout);	
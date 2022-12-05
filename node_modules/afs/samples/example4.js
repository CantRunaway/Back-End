"use strict";

// Example 4
//
// This example is the same as example 3, except that the reducer outputs a stringified array instead of a string.
var ArrayStream = require("../index.js"),
	reader = ArrayStream.createReader([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
	even = ArrayStream.createTransformer(function(val) { if (val % 2 === 0) return val; }),
	double = ArrayStream.createTransformer(function(val) { return val * 2; }),
	prettify = ArrayStream.createReducer(function(val, acc) { acc.push(val); return acc; }, [], true);

reader.pipe(even).pipe(double).pipe(prettify).pipe(process.stdout);
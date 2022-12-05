"use strict";

// Example 2
//
// This example uses a reader and two transformers to extract the even numbers from a list and then double them.
// The second transformer has stringify set to true so that the output can be piped to stdout. It will be noticed
// that the numbers are all smooshed together so you can't tell which is which.
var ArrayStream = require("../index.js"),
	reader = ArrayStream.createReader([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
	even = ArrayStream.createTransformer(function(val) { if (val % 2 === 0) return val; }),
	double = ArrayStream.createTransformer(function(val) { return val * 2; }, true);

reader.pipe(even).pipe(double).pipe(process.stdout);
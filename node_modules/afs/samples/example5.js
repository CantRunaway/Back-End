"use strict";

// Example 5
//
// This example uses a transformer to both filter a list of names and transform the results simultaneously.
// The transformer is then piped to a reducer to create an array which is then piped to stdout.
var names = [
	{forename: "Carson", surname: "Alexander"},
	{forename: "Meredith", surname: "Alonso"},
	{forename: "Arturo", surname: "Anand"},
	{forename: "Gytis", surname: "Barzdukas"},
	{forename: "Yan", surname: "Li"},
	{forename: "Peggy", surname: "Justice"},
	{forename: "Laura", surname: "Norman"},
	{forename: "Nino", surname: "Olivetto"}
];

function transformAndFilter(rec) {
	var code = "h".charCodeAt(0);
	if (rec.forename.toLowerCase().charCodeAt(0) < code) {
		rec.forename = rec.forename.toUpperCase();
		return rec;
	}
}

var ArrayStream = require("../index.js"),
	reader = ArrayStream.createReader(names),
	transformer = ArrayStream.createTransformer(transformAndFilter),
	reducer = ArrayStream.createReducer(function(val, acc) { acc.push(val); return acc; }, [], true);

reader.pipe(transformer).pipe(reducer).pipe(process.stdout);
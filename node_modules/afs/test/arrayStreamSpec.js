"use strict";

var ArrayStream = require("../index.js"),
	expect = require("chai").expect,
	// Lists for use in testing
	list1 = [{forename: "Alex", surname: "Worrell"}, {forename: "Clare", surname: "Silwood"}],
	list2 = [{forename: "Tony", surname: "Verrill"}, {forename: "Julie", surname: "Verrill"}],
	list3 = [1, 2, 3, 4, 5],
	list4 = [2, 4, 6, 8, 10];

// ================================================================================
// beginning of test suite
// ================================================================================
describe("ArrayStream", function() {

	// ================================================================================
	// createReader tests
	describe(".createReader(list)", function() {
		it("should throw a TypeError if no parameter is supplied", function() {
			expect(ArrayStream.createReader).to.throw(TypeError);
		});
		it("should throw a TypeError if the parameter is not an array", function() {
			expect(function() { ArrayStream.createReader({a:1}); }).to.throw(TypeError);
		});
		it("should throw a TypeError if the parameter is an empty array", function() {
			expect(function() { ArrayStream.createReader([]); }).to.throw(TypeError);
		});
		it("should create a 'readable' stream", function() {
			var reader = new ArrayStream.createReader(list1);

			// check for a couple of 'readable' properties
			expect(reader).to.have.property("read");
			expect(reader).to.have.property("pipe");
		});
		it("should create a reader that returns one object from the array for each read", function() {
			var arrayReader = new ArrayStream.createReader(list1),
				results = [arrayReader.read(), arrayReader.read()];
			expect(arrayReader.read()).to.be.null;
			expect(results[0]).to.have.property("forename", "Alex");
			expect(results[0]).to.have.property("surname", "Worrell");
			expect(results[1]).to.have.property("forename", "Clare");
			expect(results[1]).to.have.property("surname", "Silwood");
		});
	});
	// ================================================================================
	
	
	// ================================================================================
	// createTransformer tests
	describe(".createTransformer(callback)", function() {
		it("should throw a TypeError if no callback is supplied", function() {
			expect(ArrayStream.createTransformer).to.throw(TypeError);
		});
		it("should throw a TypeError if the callback is not a function", function() {
			expect(function() { ArrayStream.createTransformer({}); }).to.throw(TypeError);
			expect(function() { ArrayStream.createTransformer(55); }).to.throw(TypeError);
		});
		it("should create a 'transform' stream when a callback is supplied", function() {
			var transformer = ArrayStream.createTransformer(function() {});

			// check for a couple of 'readable' properties
			expect(transformer).to.have.property("read");
			expect(transformer).to.have.property("pipe");
			
			// check for a couple of 'writable' properties
			expect(transformer).to.have.property("write");
			expect(transformer).to.have.property("end");
		});
		it("should create a transformation stream that outputs objects according to the supplied transformation function", function(done) {
			var reader = ArrayStream.createReader(list3),
				transformer = ArrayStream.createTransformer(function(n) { return n * 2; }),
				results = [];

			transformer.on("data", function(data) {
				results.push(data);
			});
			
			transformer.on("end", function() {
				expect(results).to.have.length(5);
				expect(results).to.have.members(list4);
				done();
			});

			reader.pipe(transformer);
		});
		it("should skip objects when the transformation function returns null", function(done) {
			var reader = ArrayStream.createReader(list1),
				transformer = ArrayStream.createTransformer(function(obj) {
					if (obj.surname != "Worrell") { return null; }
					else { return obj; }
				}),
				results = [];

			transformer.on("data", function(data) {
				results.push(data);
			});
			
			transformer.on("end", function() {
				expect(results).to.have.length(1);
				expect(results[0]).to.have.property("forename", "Alex");
				done();
			});

			reader.pipe(transformer);
		});
		it("should skip objects when the transformation function returns undefined", function(done) {
			var reader = ArrayStream.createReader(list1),
				transformer = ArrayStream.createTransformer(function(obj) {
					if (obj.surname === "Worrell") { return obj; }
				}),
				results = [];

			transformer.on("data", function(data) {
				results.push(data);
			});
			
			transformer.on("end", function() {
				expect(results).to.have.length(1);
				expect(results[0]).to.have.property("forename", "Alex");
				done();
			});

			reader.pipe(transformer);
		});
		it("should output the objects as JSON strings if 'stringify' is set to true", function(done) {
			var reader = ArrayStream.createReader(list1),
				transformer = ArrayStream.createTransformer(function(o) { return o; }, true),
				results = [];

			transformer.on("data", function(data) {
				results.push(data);
			});
			
			transformer.on("end", function() {
				expect(results).to.have.length(2);
				expect(results[0]).to.equal(JSON.stringify(list1[0]));
				expect(results[1]).to.equal(JSON.stringify(list1[1]));
				done();
			});

			reader.pipe(transformer);
		});
		it("should allow multiple streams to be piped to it", function(done) {
			var reader1 = ArrayStream.createReader(list1),
				reader2 = ArrayStream.createReader(list2),
				transformer = ArrayStream.createTransformer(function(o) { return o; }),
				results = [];

			transformer.on("data", function(data) {
				results.push(data);
			});
			
			transformer.on("end", function() {
				expect(results).to.have.length(4);
				expect(results[0]).to.have.property("surname", "Worrell");
				expect(results[3]).to.have.property("forename", "Julie");
				done();
			});

			reader1.pipe(transformer);
			reader2.pipe(transformer);
		});
	});
	// ================================================================================
	
	
	// ================================================================================
	// createReducer tests
	describe(".createReducer(callback, initialValue, stringify)", function() {
		it("should throw an error if no callback is supplied", function() {
			expect(ArrayStream.createReducer).to.throw(TypeError);
		});
		it("should throw a TypeError if the callback is not a function", function() {
			expect(function() { ArrayStream.createReducer({}); }).to.throw(TypeError);
			expect(function() { ArrayStream.createReducer(55); }).to.throw(TypeError);
		});
		it("should create a 'transform' stream when a callback is supplied", function() {
			var reducer = ArrayStream.createReducer(function() {});

			// check for a couple of 'readable' properties
			expect(reducer).to.have.property("read");
			expect(reducer).to.have.property("pipe");
			
			// check for a couple of 'writable' properties
			expect(reducer).to.have.property("write");
			expect(reducer).to.have.property("end");
		});
		it("should correctly reduce an array stream to a single value given the correct callback function", function (done) {
			var reader = ArrayStream.createReader(list3),
				reducer = ArrayStream.createReducer(function(data, acc) { return data + acc; }),
				results = [];
			
			reducer.on('data', function(data) { results.push(data); });
			reducer.on('end', function() {
				expect(results).to.have.length(1);
				expect(results[0]).to.equal(15);
				done();
			});
			
			reader.pipe(reducer);
		});
		it("should use initialValue when provided", function(done) {
			var reader = ArrayStream.createReader(list3),
				reducer = ArrayStream.createReducer(function(data, acc) { return data + acc; }, 10),
				results = [];
			
			reducer.on('data', function(data) { results.push(data); });
			reducer.on('end', function() {
				expect(results).to.have.length(1);
				expect(results[0]).to.equal(25);
				done();
			});
			
			reader.pipe(reducer);
		});
		it("should output value as a string when 'stringify' is set to true", function(done) {
			var reader = ArrayStream.createReader(list3),
				reducer = ArrayStream.createReducer(function(data, acc) { return data + acc; }, 0, true),
				results = [];
			
			reducer.on('data', function(data) { results.push(data); });
			reducer.on('end', function() {
				expect(results).to.have.length(1);
				expect(results[0]).to.equal("15");
				done();
			});
			
			reader.pipe(reducer);
		});
	});
});

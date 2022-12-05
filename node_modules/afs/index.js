"use strict";

var stream = require("stream"),
	util = require("util"),
	options = { objectMode: true },
	exports = module.exports = {};

exports.createReader = function(list) {
	if (!list || !Array.isArray(list) || list.length === 0) {
		throw new TypeError("list must be an array with at least one element");
	}
	
	var m_data = list, reader = new stream.Readable(options);
	
	reader._read = function() {
		var self = this;
		m_data.forEach(function(element) { self.push(element); });
		self.push(null);
	};
	return reader;
};

exports.createTransformer = function(callback, stringify) {
	if (!callback || typeof callback != 'function') {
		throw new TypeError("callback must be a function");
	}
	
	var m_callback = callback,
		m_stringify = stringify ? true : false,
		transformer = new stream.Transform(options);
	
	transformer._transform = function(data, encoding, done) {
		var output = m_callback(data);
		
		// only push to output stream if callback returned something
		if (output) this.push(m_stringify ? JSON.stringify(output) : output);
		done();
	};
	
	return transformer;
};

exports.createReducer = function(callback, initialValue, stringify) {
	if (!callback || typeof callback != 'function') {
		throw new TypeError("callback must be a function");
	}
	
	var m_callback = callback,
		m_accumulator = initialValue || null,
		m_stringify = stringify ? true : false,
		reducer = new stream.Transform(options);
	
	reducer._transform = function(data, encoding, done) {
		if (m_accumulator === null) {
			m_accumulator = data;
		} else {
			m_accumulator = m_callback(data, m_accumulator);
		}
		done();
	};
	
	reducer._flush = function(done) {
		this.push(m_stringify ? JSON.stringify(m_accumulator) : m_accumulator);
		done();
	};
	
	return reducer;
};
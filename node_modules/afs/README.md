# afs - array-functional-streams
Allows arrays to be turned into a stream of objects and then run asynchronous map, filter, and reduce operations against them.

The module exposes methods to create three types of stream:
- **Reader**: read stream that turns an array into a stream of objects;
- **Transformer**: transform stream that can perform map or filter like operations against a stream of objects;
- **Reducer**: transform stream the turns a stream of objects into one object.

API
---
`createReader(array)`
---
This is the function used to transform an array into a stream. The function returns a *read* stream that operates in *object mode*.
Each read of the stream will return one object from the original array.

`createTransformer(cb[, stringify])`
---
This returns a transform stream that calls `cb(chunk)` for each object in the stream. You can simulate *map* operations by having the callback function transform the object in some way before returning it and you can simulate *filter* operations by returning `null` or `undefined` for any object that you don't want to be included in the output. `stringify` is an optional boolean value which, if set to true, causes each object to be parsed with `JSON.stringify` before being added to the output. This allows the stream to be piped directly to other streams that only support strings. This parameter defaults to false.

**Differences from `Array.prototype.map / Array.prototype.filter`:**
* You cannot add `null` elements to a stream without aborting. If your callback returns `null` or `undefined` no output is produced for that value.
* The callback only receives an object. No array index is supplied, and obviously the original array cannot be supplied.
* Map and filter do not alter the source array, which obviously makes no sense when applied to a stream. (Although, do note that the source array used to create the reader remains unaffected.)

`createReducer(cb[, initValue, stringify])`
---
This returns a transform stream that performs the operation `acc = cb(chunk, acc)` for each object in the input. Once all objects have been processed, `acc` is written to the output. If `initValue` is not `null` or `undefined` then `acc` is initialised to `initValue`, otherwise it is initialised to `null`. When an object is read from the input, if `acc` is `null` then it is initialised to be the object, otherwise the above operation is performed.

`Example`
---
There are a few examples in the *samples* folder. The following is the first.
```js
var list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
	filterFunc = function(val) { if (val < 6) return val; },
	reducerFunc = function(val, acc) { acc.push(val); return acc; },
	ArrayStream = require("../index.js"),
	reader = ArrayStream.createReader(list),
	filter = ArrayStream.createTransformer(filterFunc),
	// Note that initialValue is an empty array. This array is repeatedly passed to the 
	// reducerFunc which pushes the object to it and then returns it.
	reducer = ArrayStream.createReducer(reducerFunc, [], true);

reader.pipe(filter).pipe(reducer).pipe(process.stdout);	
```

`Testing`
---
Testing requires *mocha* to be installed globally and *chai* to be installed locally. Use the following commands to set up for testing:
* npm install -g mocha
* npm install chai

Testing can be run using the standard command `npm test`.

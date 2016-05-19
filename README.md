# async-array-wrapper

This lib wraps an array object and intercepts all iterable functions and also them to be run asynchronously.

What this is not, is a lib like [async-array](https://www.npmjs.com/package/async-array). When an array is iterated with
`async-array-wrapper`, the callback function provided on the array is executed **synchronously**, but provides a `done`
function to call to signal the the iterator function is truly finished.

This lib is designed to allow for arrays to be iterated then processed with asynchronous functions.

## Example

```javascript
const fs = require('fs');
const AsyncArray = require('./index.js');

/*
 Here we want to list all sub directories within a directory. fs lends itself to asynchronous execution which we normally
 would be unable to do with the out of the box Array.map. Here, this lib is favoured over other libs, as it initiates all
 calls to the filesystem synchronously, instead of waiting for each one to finish before initiating the next one. Thus
 improving speed of execution in these kinds of situations (similarly benefits http requests).
 */

const directory = './';
const directoryMap = null;
fs.readdir(directory, 'utf-8', (err, files) => {
  new AsyncArray(files)
    .filter((done, _) => _.substr(0, 1) !== '.')
    .map((done, file) => {
      fs.stat(`${directory}/${file}`, (err, stats) => {
        if (stats.isDirectory()) {
          done(file);
        } else {
          done(null);
        }
      });
    })
    .filter((done, directory) => directory !== null)
    .then(function (done, result) {
      /* Will list all directories under `directory` */
      console.log('Found these directories:');
      console.log(result);
    });
});

```

## Usage

The following functions are intercepted (where available):
* forEach
* map
* every
* filter
* find
* findIndex
* reduce
* reduceRight
* some

The only difference to their Array.* equivalent is that they are passed a `done` function as the first argument, the
standard arguments are then passed after. See [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)
for standard arguments that follow on each function.

You then have two options, either return a value from your callback, or use the `done` function. If you return any value
other than `undefined`, the `done` function is implicitly called for you.

Other non-callback taking functions on array won't automatically be queued. This is on purpose, as they **aren't**
chainable. If you need to do something with these, you must use the new `AsyncArray.then` function.

This can be inserted anywhere in the chain, and as such is chainable. This exposes a `done` function, then a `result`
array. For example;

```javascript
const AsyncArray = require('./index.js');
const { async } = AsyncArray.utils;

new AsyncArray([1, 2, 3, 4])
  .filter((done, entry, i) => {
    /* pretend to do something asynchronous... */
    async(() => {
      /* keep odd entries only... */
      const shouldFilterOut = i % 2 === 0;
      done(shouldFilterOut);
    })
  })
  .then((done, result) => {
    console.log(`The first entry is: ${result.slice(0, 1)}`);
    /*  The first entry is: 1 */

    console.log(`The last entry is now: ${result.slice(result.length - 1)}`);
    /*  The last entry is now: 3  */

    console.log(`Our result is: [${result.join(',')}]`);
    /*  Our result is: [1,3] */
  });

```

## Todo

* Test all remaining wrapped methods
    * map
    * every
    * filter
    * find
    * findIndex
    * reduce
    * reduceRight
    * some

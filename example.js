const fs = require('fs');
const AsyncArray = require('async-array-wrapper');
const { async } = AsyncArray.utils;

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

console.log('===============');
console.log('SCRIPT FINISHED EXECUTING');
console.log('===============');
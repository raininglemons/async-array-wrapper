
const AsyncArray = require('./source.js');
const { async } = AsyncArray.utils;
/*  TEST  */

AsyncArray(['one', 'two', 'three', 'four'])
  .forEach((done, val, i, arr) => {
    console.log(val);
    async(() => {
      if (val === 'three')
        arr.splice(i, 1);
      done();
    });
  })
  .forEach((done, val, i, arr) => {
    console.log(val);
    async(() => {
      if (val === 'one')
        arr.splice(i, 1);
      done();
    });
  })
  .map((done, val, i) => {
    console.log('mapping');
    done(`${i} -> ${val}`);
  })
  .then(function(done) {
    console.log('final array');
    console.log(this);
    done([1,2,3,4]);
  })
  .then(function(done) {
    console.log('and then again');
    console.log(this);
  });

console.log('===============');
console.log('SCRIPT FINISHED EXECUTING');
console.log('===============');
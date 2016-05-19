/*
 Tests that the queue works properly.
 */
const AsyncArray = require('../index');
const { async } = AsyncArray.utils;

describe('Test AsyncArrays can be constructed with and without the new keyword', () => {
  it('non-async', (finished) => {
    const arr = new AsyncArray([0, 1, 2, 3]);
    const record = [];

    arr
      .forEach((done, v, i) => {
        record.push(i);
        done();
      })
      .forEach((done, v, i) => {
        record.push(4 + i);
        done();
      })
      .then(() => {
        expect(record).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
        finished();
      });

    record.push(4);
  });


  it('async', (finished) => {
    const arr = AsyncArray([0, 1, 2, 3]);
    const record = [];

    arr
      .forEach((done, v, i) => {
        record.push(i);
        async(done);
      })
      .forEach((done, v, i) => {
        record.push(4 + i);
        async(done);
      })
      .then(() => {
        expect(record).toEqual([0, 1, 2, 3, 4, 5, 6, 7]);
        finished();
      });

    record.push(4);
  });
});
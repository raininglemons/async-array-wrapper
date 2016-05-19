/*
 Tests that the queue works properly.
 */
const AsyncArray = require('../index');
const { async } = AsyncArray.utils;

describe('Test AsyncArrays can be constructed with and without the new keyword', () => {
  it('should form the same object', (finished) => {
    const arr = new AsyncArray([0, 1, 2, 3]);
    const arr2 = AsyncArray([0, 1, 2, 3]);

    expect(arr).toEqual(arr2);
    finished();
  });
});
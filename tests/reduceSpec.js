/*
 Tests that the queue works properly.
 */
const AsyncArray = require('../index');
const { async } = AsyncArray.utils;

describe('Test AsyncArrays.reduce behaves like Array.reduce', () => {
  describe('uses same initial value when none returned', () => {
    it('async', (finished) => {
      new AsyncArray(['one', 'two'])
        .reduce((done, o, v, i) => {
          async(() => {
            o[v] = true;
            done(o);
          });
        }, {})
        .then((done, result) => {
          expect(result).toEqual({ one: true, two: true });
          finished();
        });
    });
  });
});
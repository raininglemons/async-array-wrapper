/*
 Tests that the queue works properly.
 */
const AsyncArray = require('../index');
const { async } = AsyncArray.utils;

describe('Test AsyncArrays.forEach behaves like Array.forEach', () => {
  describe('returned values don\'t affect chained functions', () => {
    it('non-async', (finished) => {
      new AsyncArray([0, 1, 2, 3])
        .forEach((done, v, i) => {
          done(null);
          return null;
        })
        .then(function() {
          expect(this.toArray()).toEqual([0, 1, 2, 3]);
          finished();
        });
    });

    it('async', (finished) => {
      new AsyncArray([0, 1, 2, 3])
        .forEach((done, v, i) => {
          async(() => done(null))
          return null;
        })
        .then(function() {
          expect(this.toArray()).toEqual([0, 1, 2, 3]);
          finished();
        });
    });
  });

  describe('array passed in arguments to callback IS affected', () => {
    it('non-async', (finished) => {
      new AsyncArray([0, 1, 2, 3])
        .forEach((done, v, i, a) => {
          a.splice(0);
          done();
        })
        .then(function() {
          expect(this.toArray()).toEqual([]);
          finished();
        });
    });

    it('async', (finished) => {
      new AsyncArray([0, 1, 2, 3])
        .forEach((done, v, i, a) => {
          a.splice(0);
          async(() => done);
        })
        .then(function() {
          expect(this.toArray()).toEqual([]);
          finished();
        });
    });
  });
});
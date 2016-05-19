function AsyncArray(src) {
  if (!(src instanceof Array)) {
    throw new TypeError('1 argument of type Array is required');
  }
  if (!(this instanceof AsyncArray)) {
    return new AsyncArray(src);
  }

  Object.defineProperties(this, {
    __running__: {
      value: false,
      enumerable: false,
      writable: true,
    },
    __async_queue__: {
      value: [],
      enumerable: false,
      writable: false,
    },
    __result__: {
      value: src.slice(0),
      enumerable: false,
      writable: true,
    },
  });

  src.forEach(entry => this.push(entry));
}

AsyncArray.prototype.__proto__ = Array.prototype;

AsyncArray.prototype.__running__ = false;

AsyncArray.prototype.__async_queue__ = [];

AsyncArray.prototype.__result__ = null;

/**
 * Queues up a function to be executed asynchronously
 * @param cb {Callback}
 */
function async(cb) {
  process.nextTick(cb);
}

/**
 * Starts the next queued method on the array object
 */
function nextInQueue() {
  this.__running__ = false;
  if (this.__async_queue__.length) {
    if (!this.__running__ && this.__async_queue__.length) {
      const { fn, args } = this.__async_queue__.splice(0, 1)[0];
      fn.apply(this, args);
    }
  }
}

/**
 * Generates a wrapper function for a native Array.prototype function
 * @param superFn {Function}
 * @returns {iterableFn}
 */
function generateIterableWrapper(superFn, methodName) {
  return function iterableFn(callback, ...extraArgs) {
    /*
     If already waiting on a previous function to finish, queue up this
     call instead of executing it.
     */
    if (this.__running__) {
      this.__async_queue__.push({ fn: iterableFn, args: [callback].concat(extraArgs) });
    } else {
      this.__running__ = true;
      /*
       Instead of using a counter to detect how many done() functions have
       been called, instead keep an array of each instance. This avoids any
       problems if a done() instance is called accidentally more than once.
       */
      const doneFn = [];
      const responses = [];
      let i = 0;
      const me = this;

      superFn.apply(this.__result__, [function (...args) {
        const ii = i++;
        const done = (val) => async(() => {
          const index = doneFn.indexOf(done);
          if (index > -1) {
            responses[ii] = val;
            doneFn.splice(index, 1);
            if (doneFn.length === 0) {
              let iii = 0;
              const result = superFn.call(me.__result__, () => responses[iii++]);
              me.__result__ = result || me.__result__;
              nextInQueue.call(me);
            }
          }
        });

        doneFn.push(done);

        const resp = callback.apply(this.__result__, [done].concat(args));
        if (resp !== undefined) {
          done(resp);
        }

        return resp || args[0];
      }].concat(extraArgs));
    }
    return this;
  };
}

const supportedFunctions = [
  'forEach',
  'map',
  'every',
  'filter',
  'find',
  'findIndex',
  'reduce',
  'reduceRight',
  'some',
];

supportedFunctions.forEach((fn) => {
  if (Array.prototype[fn]) {
    AsyncArray.prototype[fn] = generateIterableWrapper(Array.prototype[fn], fn);
  }
});

function then(callback, ...args) {
  if (this.__running__) {
    this.__async_queue__.push({ fn: then, args: [callback].concat(args) });
  } else {
    const done = (resp) => {
      this.__result__ = resp || this.slice(0);
      nextInQueue.call(this);
    };
    callback.call(this, done, this.__result__);
  }
  return this;
}

AsyncArray.prototype.then = then;

AsyncArray.utils = { async };

module.exports = AsyncArray;

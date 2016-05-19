function AsyncArray(src, meta) {
  const clone = src.slice(0);
  if (!(clone instanceof AsyncArray)) {
    clone.__proto__ = AsyncArray.prototype;
    Object.defineProperties(clone, {
      __running__: {
        value: false,
        enummerable: false,
      },
      __async_queue__: {
        value: [],
        enumerable: false,
        writable: false,
      },
    });
  }
  if (meta) {
    clone.__running__ = meta.__running__;
    clone.__async_queue__ = meta.__async_queue__;
  }
  return clone;
}

AsyncArray.prototype.__proto__ = Array.prototype;

AsyncArray.prototype.__running__ = false;

AsyncArray.prototype.__async_queue__ = [];

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
function generateIterableWrapper(superFn) {
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

      superFn.apply(this, [function (...args) {
        const ii = i++;
        const done = (val) => async(() => {
          const index = doneFn.indexOf(done);
          if (index > -1) {
            responses[ii] = val;
            doneFn.splice(index, 1);
            if (doneFn.length === 0) {
              let iii = 0;
              const result = superFn.call(me, () => responses[iii++]);
              nextInQueue.call(result ? new AsyncArray(result, me) : me);
            }
          }
        });

        doneFn.push(done);

        return callback.apply(this, [done].concat(args));
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
    AsyncArray.prototype[fn] = generateIterableWrapper(Array.prototype[fn]);
  }
});

function then(callback, ...args) {
  if (this.__running__) {
    this.__async_queue__.push({ fn: then, args: [callback].concat(args) });
  } else {
    const done = (resp) => {
      nextInQueue.call(resp ? new AsyncArray(resp) : this);
    };
    callback.call(this, done);
  }
  return this;
}

AsyncArray.prototype.then = then;

function toArray() {
  return [].concat(this);
}

AsyncArray.prototype.toArray = toArray;

AsyncArray.utils = { async };

module.exports = AsyncArray;

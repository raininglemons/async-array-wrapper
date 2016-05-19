function AsyncArray(src) {
  clone = src.slice(0);
  if (!(clone instanceof AsyncArray)) {
    clone.__proto__ = AsyncArray.prototype;
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
      const { fn, arguments } = this.__async_queue__.splice(0, 1)[0];
      fn.apply(this, arguments);
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
      this.__async_queue__.push({ fn: iterableFn, arguments });
    } else {
      this.__running__ = true;
      /*
      Instead of using a counter to detect how many done() functions have
      been called, instead keep an array of each instance. This avoids any
      problems if a done() instance is called accidentally more than once.
       */
      const doneFn = [];
      let me = this;

      const resp = superFn.apply(this, [function (...args) {
        const done = () => async(() => {
          const index = doneFn.indexOf(done);
          if (index > -1) {
            doneFn.splice(index, 1);
            if (doneFn.length === 0) {
              nextInQueue.call(me);
            }
          }
        });

        doneFn.push(done);

        return callback.apply(this, [done].concat(args));
      }].concat(extraArgs));

      /*
      Replace array with result of action if provided.
       */
      if (resp)
        me = AsyncArray(resp);
    }
    return this;
  };
}

AsyncArray.prototype.forEach = generateIterableWrapper(Array.prototype.forEach);
AsyncArray.prototype.map = generateIterableWrapper(Array.prototype.map);
AsyncArray.prototype.every = generateIterableWrapper(Array.prototype.every);
AsyncArray.prototype.filter = generateIterableWrapper(Array.prototype.filter);
AsyncArray.prototype.find = generateIterableWrapper(Array.prototype.find);
AsyncArray.prototype.findIndex = generateIterableWrapper(Array.prototype.findIndex);
AsyncArray.prototype.reduce = generateIterableWrapper(Array.prototype.reduce);
AsyncArray.prototype.reduceRight = generateIterableWrapper(Array.prototype.reduceRight);
AsyncArray.prototype.some = generateIterableWrapper(Array.prototype.some);

function then(callback) {
  if (this.__running__) {
    this.__async_queue__.push({ fn: then, arguments });
  } else {
    const done = (resp) => {
      nextInQueue.call(resp ? AsyncArray(resp) : this);
    };
    callback.call(this, done);
  }
  return this;
}

AsyncArray.prototype.then = then;

AsyncArray.utils = { async };

module.exports = AsyncArray;
const PureImagePrinter = require('./src/pure-image-printer');
const {applyWorkerPool} = require('./src/print-worker-thread/worker-pool');

module.exports = new Proxy(PureImagePrinter, {
  construct(target, argArray) {
    const width = argArray[0] || null;
    const height = argArray[1] || null;
    const opts = argArray[2] || {};

    const newObj = new target(width, height, opts);
    applyWorkerPool(newObj, Reflect.ownKeys(newObj.__proto__));
    return newObj;
  }
});

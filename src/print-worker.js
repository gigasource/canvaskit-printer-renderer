const wkPool = require('workerpool');
const workerPool = wkPool.pool();

// const NUMBER_OF_WORKER = wkPool.cpus > 1 ? wkPool.cpus - 1 : 1;
const NUMBER_OF_WORKER = 4;
let id = 0;
const a = new SharedArrayBuffer(8);

function execPrintTasks(printTasks) {
  return new Promise((resolve, reject) => {
    const fn = async (tasks, id, a) => {
      const path = require('path');
      const fs = require('fs');

      const pureImagePrinterFilePath = [
        path.resolve(`${__dirname}/../../@gigasource/pureimage-printer-renderer/src/pure-image-printer.js`),
        path.resolve(`${__dirname}/../../../src/pure-image-printer.js`),
      ].reduce((acc, path) => {
        if (fs.existsSync(path)) return path;
        else return acc;
      }, null);

      const PureImagePrinter = require(pureImagePrinterFilePath);

      const printer = new PureImagePrinter();

      for (let i = 0; i < tasks.length; i++) {
        const {fnName, argArray} = tasks[i];
        await printer[fnName].apply(printer, argArray);
      }

      return {data: printer.canvas.data, width: printer.canvasWidth, height: printer.currentPrintY};
    };

    workerPool.exec(fn, [printTasks, id++, a])
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}

module.exports = {
  execPrintTasks,
  NUMBER_OF_WORKER,
}

const path = require('path');
const wkPool = require('workerpool');

const PureImagePrinter = require('../pure-image-printer');
const COMMANDS_PER_WORKER = 1;

const workerPool = wkPool.pool(path.resolve(`${__dirname}/worker-script.js`));

// functions that can be divided to separated workers
const DIVISIBLE_FUNCTIONS = [
  'newLine',
  'drawLine',
  'tableCustom',
  'leftRight',
  'println',
  'printQrCode',
  'printBarcode',
  'printImage',
];

// functions that need to be run on all workers
const INDIVISIBLE_FUNCTIONS = [
  'alignLeft',
  'alignRight',
  'alignCenter',
  'setTextDoubleHeight',
  'setTextDoubleWidth',
  'setTextQuadArea',
  'bold',
  'italic',
  'setTextNormal',
  'invert',
  'setFontSize',
];

function applyQueueFunctionProxy(obj, keys) {
  obj.divisibleCommands = [];
  obj.indivisibleCommands = [];
  obj.commandIndex = 0;

  keys.forEach(key => {
    if (key.startsWith('_') || typeof obj[key] !== 'function' || key === 'constructor') return;

    obj[key] = new Proxy(obj[key], {
      apply(target, thisArg, argArray) {
        return new Promise((async (resolve) => {
          if (DIVISIBLE_FUNCTIONS.includes(key)) {
            obj.divisibleCommands.push({fnName: key, argArray, commandIndex: obj.commandIndex++});
          } else if (INDIVISIBLE_FUNCTIONS.includes(key)) {
            obj.indivisibleCommands.push({fnName: key, argArray, commandIndex: obj.commandIndex++});
          } else if (key === 'print' || key === 'printToFile') {
            const buffers = await renderBuffers(obj);

            const canvasData = buffers.reduce((acc, {data, width, height}) => ({
              finalBuffer: Buffer.concat([acc.finalBuffer, data.slice(0, Math.ceil(width * height / 8))]),
              finalHeight: acc.finalHeight + height,
              finalWidth: Math.max(acc.finalWidth, width),
            }), {finalBuffer: Buffer.from([]), finalHeight: 0, finalWidth: 0});

            const originalCanvasBuffer = thisArg.canvas.data;
            const originalCanvasWidth = thisArg.canvas.width;
            const originalCanvasHeight = thisArg.canvas.height;
            const originalPrintY = thisArg.canvas.currentPrintY;

            thisArg.canvas.data = canvasData.finalBuffer;
            thisArg.canvas.width = canvasData.finalWidth;
            thisArg.canvas.height = canvasData.finalHeight;
            thisArg.currentPrintY = canvasData.finalHeight;

            await target.apply(thisArg, argArray);

            thisArg.canvas.data = originalCanvasBuffer;
            thisArg.canvas.width = originalCanvasWidth;
            thisArg.canvas.height = originalCanvasHeight;
            thisArg.currentPrintY = originalPrintY;

            obj.commandIndex = 0;
          } else {
            await target.apply(thisArg, argArray);

            obj.commandIndex = 0;
          }

          resolve();
        }));
      }
    });
  });
}

async function renderBuffers({divisibleCommands, indivisibleCommands}) {
  const commandsPerWorker = COMMANDS_PER_WORKER;
  let buffers = [];

  let sliceIndex = 0;
  while (sliceIndex < divisibleCommands.length) {
    const slicedCommands = divisibleCommands.slice(sliceIndex, sliceIndex + commandsPerWorker);

    if (slicedCommands.length === 0) continue;

    const workerCommands = [...indivisibleCommands, ...slicedCommands]
      .filter(e => e.commandIndex <= slicedCommands[slicedCommands.length - 1].commandIndex)
      .sort((e1, e2) => e1.commandIndex - e2.commandIndex);

    buffers.push(execPrintTasks(workerCommands));

    sliceIndex += commandsPerWorker;
  }

  return Promise.all(buffers);
}

function execPrintTasks(printTasks) {
  return new Promise((resolve, reject) => {
    workerPool.exec('execPrintTasks', [printTasks])
      .then(res => resolve(res))
      .catch(err => reject(err));
  });
}

module.exports = new Proxy(PureImagePrinter, {
  construct(target, argArray) {
    const width = argArray[0] || null;
    const height = argArray[1] || null;
    const opts = argArray[2] || {};

    const newObj = new target(width, height, opts);
    applyQueueFunctionProxy(newObj, Reflect.ownKeys(newObj.__proto__));
    return newObj;
  }
});
const queue = require('queue');
const {execPrintTasks, NUMBER_OF_WORKER} = require('./print-worker');
const PureImagePrinter = require('./pure-image-printer');
const {v4: uuidv4} = require('uuid');

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

const instanceExecutionMap = {};
const instanceBufferMap = {};

// queue to make instances run sequentially
const printQueue = queue({
  concurrency: 1,
  autostart: true,
});

const taskExecutionQueue = queue({
  concurrency: 1,
  autostart: true,
});

const taskListMapping = {
  // map an instance id to a list of tasks
}

let executingInstanceId = null;
const INSTANCE_EXECUTION_TIMEOUT = 1000 * 60 * 3; // 3 minutes


function applyQueueFunctionProxy(obj, keys) {
  obj.instanceId = uuidv4();
  obj.divisibleCommands = [];
  obj.indivisibleCommands = [];

  keys.forEach(key => {
    if (key.startsWith('_') || typeof obj[key] !== 'function' || key === 'constructor') return;

    obj[key] = new Proxy(obj[key], {
      apply(target, thisArg, argArray) {
        return new Promise((async (resolve, reject) => {
          if (DIVISIBLE_FUNCTIONS.includes(key)) {
            obj.divisibleCommands.push({fnName: key, argArray});
          } else if (INDIVISIBLE_FUNCTIONS.includes(key)) {
            obj.divisibleCommands.push({fnName: key, argArray});
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
          } else {
            await target.apply(thisArg, argArray);
          }

          resolve();
        }));
      }
    });
  });
}

async function renderBuffers({divisibleCommands, indivisibleCommands, instanceId}) {
  const commandsPerWorker = Math.ceil(divisibleCommands.length / NUMBER_OF_WORKER);
  let buffers = [];

  let sliceIndex = 0;
  while (sliceIndex < divisibleCommands.length) {
    const workerCommands = [...indivisibleCommands, ...divisibleCommands.slice(sliceIndex, sliceIndex + commandsPerWorker)];
    buffers.push(execPrintTasks(workerCommands, instanceId));

    sliceIndex += commandsPerWorker;
  }

  buffers = await Promise.all(buffers);
  return buffers;
}

module.exports = new Proxy(PureImagePrinter, {
  construct(target, argArray) {
    let opts = {createCanvas: false};

    if (argArray.length > 0) opts = {...argArray.pop(), ...opts};

    const newObj = new target(...argArray, opts);
    applyQueueFunctionProxy(newObj, Reflect.ownKeys(newObj.__proto__));
    return newObj;
  }
});

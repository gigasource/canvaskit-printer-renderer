const wkPool = require('workerpool');
const PureImagePrinter = require('../pure-image-printer');
let printer;

async function execPrintTasks(printTasks, currentInvert) {
  if (!printer) printer = new PureImagePrinter(560, 250, {noResizing: true});
  printer.invert(currentInvert)
  if (printer.currentPrintY > 0) printer._reset();

  for (let i = 0; i < printTasks.length; i++) {
    const {fnName, argArray} = printTasks[i];
    await printer[fnName].apply(printer, argArray);
  }

  return {
    data: printer.canvas.data.slice(0, Math.ceil(printer.originalCanvasWidth * printer.currentPrintY / 8)),
    width: printer.originalCanvasWidth,
    height: printer.currentPrintY
  };
}

wkPool.worker({
  execPrintTasks,
});

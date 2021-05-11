const PureImage = require('@gigasource/pureimage');
const path = require('path');
const fs = require('fs');
const CanvasTxt = require('./canvas-txt');
const {Readable, Writable} = require('stream');
const {PNG} = require('pngjs');

let QRCode;
let JsBarcode;

const DEFAULT_CANVAS_WIDTH = 560;
const DEFAULT_CANVAS_HEIGHT = 700;
const DEFAULT_FONT_SIZE = 24;
const DEFAULT_NEW_LINE_FONT_SIZE = 4;
const BASE_FONT_FAMILY = 'Verdana';

// the resizing amount, example: 2500 + CANVAS_HEIGHT_EXTENSION + CANVAS_HEIGHT_EXTENSION...
const CANVAS_HEIGHT_EXTENSION = 500;
// example: canvas height is 2500, if printY >= canvas height - CANVAS_HEIGHT_RESIZING_REMAINING (=2000) then resizing will happen
const CANVAS_HEIGHT_RESIZING_REMAINING = 300;

const fontInfo = {
  normal: {
    fontFilePath: path.resolve(__dirname + `/../assets/fonts/${BASE_FONT_FAMILY}.ttf`),
    fontFamily: 'Verdana',
  },
  bold: {
    fontFilePath: path.resolve(__dirname + `/../assets/fonts/${BASE_FONT_FAMILY}_Bold.ttf`),
    fontFamily: 'Verdana_Bold',
  },
  italic: {
    fontFilePath: path.resolve(__dirname + `/../assets/fonts/${BASE_FONT_FAMILY}_Italic.ttf`),
    fontFamily: 'Verdana_Italic',
  },
  boldItalic: {
    fontFilePath: path.resolve(__dirname + `/../assets/fonts/${BASE_FONT_FAMILY}_Bold_Italic.ttf`),
    fontFamily: 'Verdana_Bold_Italic',
  },
}

Object.keys(fontInfo).forEach(fontType => {
  const {fontFilePath, fontFamily} = fontInfo[fontType];
  PureImage.registerFont(fontFilePath, fontFamily).loadSync();
});

class PureImagePrinter {

  getDefaultFontSize() {
    return Math.round(this.ratio * DEFAULT_FONT_SIZE)
  }

  getDefaultNewLineFontSize() {
    return Math.round(this.ratio * DEFAULT_NEW_LINE_FONT_SIZE)
  }
  constructor(width, height, opts = {}) {
    if (height && typeof height === 'object') opts = height;

    const {printFunctions = {}, createCanvas = true, noResizing, autoAdjustFontsize = false} = opts;

    this.opts = opts
    if (createCanvas) {
      this._externalPrintPng = printFunctions.printPng;
      this._externalPrint = printFunctions.print;
      CanvasTxt.vAlign = 'top';

      this.originalCanvasWidth = !isNaN(width) ? width : DEFAULT_CANVAS_WIDTH;
      this.originalCanvasHeight = !isNaN(height) ? height : DEFAULT_CANVAS_HEIGHT;
      this.ratio = autoAdjustFontsize ? this.originalCanvasWidth / DEFAULT_CANVAS_WIDTH : 1
      this.noResizing = noResizing;
      this.invert(false)
      this.paddingHorizontal = 0;
      this.paddingVertical = 0;
      this.printWidth = this.originalCanvasWidth - this.paddingHorizontal * 2;

      this.currentPrintX = this.paddingHorizontal;
      this.currentPrintY = this.paddingVertical;

      this.textAlign = 'left';
      this.fontSize = this.getDefaultFontSize();
      this.newLineFontSize = this.getDefaultNewLineFontSize();
      this.fontBold = false;
      this.fontItalic = false;

      this.canvas = PureImage.make(this.originalCanvasWidth, this.originalCanvasHeight, {});
      this.canvasContext = this.canvas.getContext('2d');
      this.canvasContext.translate(0.5, 0.5)
      this._fillCanvasWithWhite();
    }
  }

  alignLeft() {
    this.textAlign = 'left';
  }

  alignRight() {
    this.textAlign = 'right';
  }

  alignCenter() {
    this.textAlign = 'center';
  }

  setTextDoubleHeight() {
    this.fontSize = Math.round(this.getDefaultFontSize() * 2);
    this.newLineFontSize = Math.round(this.getDefaultNewLineFontSize() * 2);
  }

  setTextDoubleWidth() {
    this.fontSize = this.getDefaultFontSize();
    this.newLineFontSize = this.getDefaultNewLineFontSize();
  }

  setTextQuadArea() {
    this.fontSize = Math.round(this.getDefaultFontSize() * 2);
    this.newLineFontSize = Math.round(this.getDefaultNewLineFontSize() * 2);
  }

  bold(isBold) {
    this.fontBold = isBold;
  }

  italic(isItalic) {
    this.fontItalic = isItalic;
  }

  setTextNormal() {
    this.fontSize = this.getDefaultFontSize();
    this.newLineFontSize = this.getDefaultNewLineFontSize();
    this.bold(false);
    this.italic(false);
  }

  invert(enabled) {
    this.invertColor = enabled
  }

  setFontSize(fontSize) {
    this.fontSize = fontSize * this.ratio;
  }

  newLine(customNewLineFontSize) {
    const currentFontSize = this.fontSize;
    this.fontSize = customNewLineFontSize || this.newLineFontSize;

    const {height: paragraphHeight} = this._drawParagraph('\n', this.currentPrintX, this.currentPrintY, this.printWidth);
    this._increasePrintY(paragraphHeight);
    this.fontSize = currentFontSize
  }

  marginTop(x) { //x(cm)
    const ratio = Math.floor(96 / 2.54)
    for(let i = 0 ; i < x; i++) {
      this.newLine(ratio)
    }
  }

  drawLine() {
    this._increasePrintY(this.getDefaultFontSize());
    const y = this.currentPrintY - this.getDefaultFontSize() / 2;

    this.canvasContext.fillStyle = 'black';
    this.canvasContext.drawLine({start: {x: 0, y}, end: {x: this.originalCanvasWidth, y}});
  }

  tableCustom(columns) {
    const currentPrintX = this.currentPrintX;

    // for fixing a bug of canvas-txt relating to paragraph width < single character width, causing infinite while loop
    // this variable is for ensuring total paragraph width doesn't become larger than canvas width
    let totalParagraphWidthExtension = 0;

    const originalBold = this.fontBold
    const heights = [];

    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];

      let {text, align, width, bold} = column;
      this.bold(bold || false)

      if (width < 0) width = 0;
      else if (width > 1) width = 1.0;

      let paragraphLayoutWidth = this.printWidth * width;
      const currentTextAlign = this.textAlign;

      if (i === columns.length - 1 && totalParagraphWidthExtension > 0) {
        paragraphLayoutWidth -= Math.round(totalParagraphWidthExtension);
        totalParagraphWidthExtension = 0;
      }

      if (align.toUpperCase() === 'LEFT') this.textAlign = 'left';
      else if (align.toUpperCase() === 'RIGHT') this.textAlign = 'right';
      else if (align.toUpperCase() === 'CENTER') this.textAlign = 'center';

      const {height: paragraphHeight, width: paragraphWidth} =
        this._drawParagraph(text, this.currentPrintX, this.currentPrintY, paragraphLayoutWidth);

      const paragraphWidthExtension = paragraphWidth - paragraphLayoutWidth;
      if (paragraphWidthExtension > 0) totalParagraphWidthExtension += paragraphWidthExtension;

      this.currentPrintX += paragraphWidth;

      this.textAlign = currentTextAlign;
      heights.push(paragraphHeight);
      this.bold(false)
    }

    const maxHeight = heights.sort((e1, e2) => e2 - e1)[0];
    this._increasePrintY(maxHeight);
    this.currentPrintX = currentPrintX;
    this.bold(originalBold)
  }

  leftRight(leftText, rightText) {
    const total = leftText.length + rightText.length
    this.tableCustom([
      {text: leftText, align: 'LEFT', width: leftText.length / total, bold: this.fontBold},
      {text: rightText, align: 'RIGHT', width: rightText.length / total, bold: this.fontBold},
    ])
  }

  println(text) {
    const {height: paragraphHeight} = this._drawParagraph(text, this.currentPrintX, this.currentPrintY, this.printWidth);
    this._increasePrintY(paragraphHeight);
  }

  _canvasToPngBuffer(canvas, customHeight) {
    return new Promise(async resolve => {
      let canvasImageBuffer = Buffer.from([]);
      const currentCanvasHeight = canvas.height;
      if (!isNaN(customHeight)) canvas.height = customHeight;

      const writeStream = new Writable();
      writeStream._write = function (chunk, encoding, cb) {
        canvasImageBuffer = Buffer.concat([canvasImageBuffer, chunk]);
        cb();
      }
      writeStream.on('finish', async () => {
        canvas.height = currentCanvasHeight;
        resolve(canvasImageBuffer);
      });
      await PureImage.encodePNGToStream(canvas, writeStream);
    });
  }

  async printToFile(outputFilePath) {
    const currentCanvasHeight = this.canvas.height;
    this.canvas.height = this.currentPrintY;

    const writeStream = fs.createWriteStream(path.resolve(outputFilePath));
    writeStream.on('finish', async () => {
      this.canvas.height = currentCanvasHeight;
    });

    await PureImage.encodePNGToStream(this.canvas, writeStream);
  }

  async print() {
    const pngBuffer = await this._canvasToPngBuffer(this.canvas, this.currentPrintY);
    const png = PNG.sync.read(pngBuffer);

    if (typeof this._externalPrintPng === 'function' && typeof this._externalPrint === 'function') {
      await this._externalPrintPng(png);
      await this._externalPrint();
    }

    this._reset();
  }

  _reset() {
    // set text normal
    this.fontSize = this.getDefaultFontSize();
    this.newLineFontSize = this.getDefaultNewLineFontSize();
    this.bold(false);
    this.italic(false);

    // align left (default)
    this.textAlign = 'left';

    // shrink canvas & fill with white
    this._shrinkCanvasHeight();
    this._fillCanvasWithWhite();
  }

  printQrCode(text) {
    if (!QRCode) QRCode = require('qrcode');

    if (typeof text !== 'string') text = text.toString();

    return new Promise(resolve => {
      let qrBinData = Buffer.from([]);

      const writeStream = new Writable();
      writeStream._write = function (chunk, encoding, cb) {
        qrBinData = Buffer.concat([qrBinData, chunk]);
        cb();
      }
      writeStream.on('finish', () => {
        this._printImage(qrBinData, 'buffer').then(resolve);
      });

      QRCode.toFileStream(writeStream, text);
    });
  }

  async printBarcode(text, opts = {}) {
    if (!JsBarcode) JsBarcode = require('jsbarcode');

    let {height = 80, width = 3.5, displayValue = false} = opts;
    height = Math.round(height * this.ratio)
    let canvas = PureImage.make(this.printWidth, height * 2 + 50, {});
    this._fillCanvasWithWhite(canvas);
    JsBarcode(canvas, text, {
      height,
      width,
      displayValue,
      marginLeft: 0,
      marginRight: 0,
      ...opts,
    });

    const barcodeImageBuffer = await this._canvasToPngBuffer(canvas);
    await this._printImage(barcodeImageBuffer, 'buffer');
    canvas.data = null;
    canvas = null;
  }

  printImage(imageInput, inputType, ratio) {
    return this._printImage(imageInput, inputType, ratio);
  }

  async _printImage(imageInput, inputType = 'path', ratio = 1) {
    let imageX = this.currentPrintX;
    let imageData;
    if (inputType === 'base64') {
      imageInput = Buffer.from(imageInput, 'base64')
      inputType = 'buffer'
    }
    if (inputType === 'path') {
      const fStream = fs.createReadStream(imageInput)
      imageData = await PureImage.decodePNGFromStream(fStream)
    }
    if (inputType === 'buffer') {
      const imageReadStream = new Readable();
      imageReadStream.push(imageInput);
      imageReadStream.push(null);
      imageData = await PureImage.decodePNGFromStream(imageReadStream)
    }
    const {width: imgWidth, height: imgHeight} = imageData
    const scaledImgHeight = imgHeight / (imgWidth / this.originalCanvasWidth) * ratio
    const scaledImgWidth = imgWidth / (imgWidth / this.originalCanvasWidth) * ratio
    switch (this.textAlign) {
      case 'left': {
        imageX = this.currentPrintX;
        break;
      }
      case 'right': {
        imageX = this.currentPrintX + this.printWidth - scaledImgWidth;
        break;
      }
      case 'center': {
        imageX = this.originalCanvasWidth / 2 - scaledImgWidth / 2;
        break
      }
    }
    this.canvasContext.drawImage(imageData,
      0, 0, imgWidth, imgHeight,                      // source dimensions
      imageX, this.currentPrintY, scaledImgWidth, scaledImgHeight  // destination dimensions
    );
    this._increasePrintY(scaledImgHeight);
  }

  _drawParagraph(text, x, y, layoutWidth) {
    if (typeof text !== 'string') text = text.toString();

    let fontFamily;

    if (this.fontBold && this.fontItalic) {
      fontFamily = fontInfo.boldItalic.fontFamily;
    } else if (this.fontBold) {
      fontFamily = fontInfo.bold.fontFamily;
    } else if (this.fontItalic) {
      fontFamily = fontInfo.italic.fontFamily;
    } else {
      fontFamily = fontInfo.normal.fontFamily;
    }

    CanvasTxt.align = this.textAlign;
    CanvasTxt.font = fontFamily;
    CanvasTxt.fontSize = this.fontSize;
    this.canvasContext.fillStyle = 'black';
    const {height, width} = CanvasTxt.drawText(this.canvasContext, text, x, y, layoutWidth, this.fontSize, this.invertColor);

    return {height, width};
  }

  _increasePrintY(value) {
    this.currentPrintY += value;
    this.currentPrintY = Math.round(this.currentPrintY);

    if (!this.noResizing && this.currentPrintY + CANVAS_HEIGHT_RESIZING_REMAINING >= this.canvas.height) {
      this.canvas.height += CANVAS_HEIGHT_EXTENSION;

      const width = Math.floor(this.originalCanvasWidth);
      const height = Math.floor(CANVAS_HEIGHT_EXTENSION);

      const bufferToAppend = Buffer.alloc(Math.ceil(width * height / 8), 255);

      this.canvas.data = Buffer.concat([this.canvas.data, bufferToAppend]);
    }
  }

  _fillCanvasWithWhite(canvas = this.canvas) {
    canvas.data.fill(255);
  }

  _shrinkCanvasHeight() {
    this.canvas.height = this.originalCanvasHeight;
    const newBufferSize = Math.floor(this.originalCanvasWidth) * Math.floor(this.originalCanvasHeight) / 8;
    this.canvas.data = this.canvas.data.slice(0, newBufferSize);
    this.currentPrintX = 0;
    this.currentPrintY = 0;
  }

  cleanup(resetCanvas = true) {
    if (this.canvas && resetCanvas) {
      this._shrinkCanvasHeight();
      this._fillCanvasWithWhite();
    }

    this.canvasContext = null;
    this.canvas = null;
  }
}

module.exports = PureImagePrinter;

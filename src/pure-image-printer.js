const PureImage = require('@gigasource/pureimage');
const path = require('path');
const fs = require('fs');
const CanvasTxt = require('./canvas-txt');
const {Readable, Writable} = require('stream');
const {PNG} = require('pngjs');
const QRCode = require('qrcode');
const JsBarcode = require('jsbarcode');

const DEFAULT_CANVAS_WIDTH = 560;
const DEFAULT_CANVAS_HEIGHT = 700;
const DEFAULT_FONT_SIZE = 24;
const DEFAULT_NEW_LINE_FONT_SIZE = 4;
const DEFAULT_FONT = 'Verdana';

// the resizing amount, example: 2500 + CANVAS_HEIGHT_EXTENSION + CANVAS_HEIGHT_EXTENSION...
const CANVAS_HEIGHT_EXTENSION = 500;
// example: canvas height is 2500, if printY >= canvas height - CANVAS_HEIGHT_RESIZING_REMAINING (=2000) then resizing will happen
const CANVAS_HEIGHT_RESIZING_REMAINING = 300;

class PureImagePrinter {
  constructor(width = DEFAULT_CANVAS_WIDTH, ...args) {
    // print functions from pos-restaurant, used for backward compatibility
    let opts = {};

    if (typeof args[0] === 'object') opts = args[0];
    else if (typeof args[1] === 'object') opts = args[1]; // backward compatibility;

    const {printFunctions = {}, createCanvas = true} = opts;

    if (createCanvas) {
      this._externalPrintPng = printFunctions.printPng;
      this._externalPrint = printFunctions.print;
      CanvasTxt.vAlign = 'top';

      this.canvasWidth = width;

      this.paddingHorizontal = 0;
      this.paddingVertical = 0;
      this.printWidth = this.canvasWidth - this.paddingHorizontal * 2;

      this.currentPrintX = this.paddingHorizontal;
      this.currentPrintY = this.paddingVertical;

      this.textAlign = 'left';
      this.fontSize = DEFAULT_FONT_SIZE;
      this.newLineFontSize = DEFAULT_NEW_LINE_FONT_SIZE;
      this.fontBold = false;
      this.fontItalic = false;

      this.fontFamily = DEFAULT_FONT;
      this.currentFont = null;
      this.fontFilePaths = {
        normal: path.resolve(__dirname + `/../assets/fonts/${this.fontFamily}.ttf`),
        bold: path.resolve(__dirname + `/../assets/fonts/${this.fontFamily}_Bold.ttf`),
        italic: path.resolve(__dirname + `/../assets/fonts/${this.fontFamily}_Italic.ttf`),
        boldItalic: path.resolve(__dirname + `/../assets/fonts/${this.fontFamily}_Bold_Italic.ttf`),
      }

      this.canvas = PureImage.make(DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, {});
      this.canvasContext = this.canvas.getContext('2d');
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
    this.fontSize = Math.round(DEFAULT_FONT_SIZE * 2);
    this.newLineFontSize = DEFAULT_NEW_LINE_FONT_SIZE * 2;
  }

  setTextDoubleWidth() {
    this.fontSize = DEFAULT_FONT_SIZE;
    this.newLineFontSize = DEFAULT_NEW_LINE_FONT_SIZE;
  }

  setTextQuadArea() {
    this.fontSize = Math.round(DEFAULT_FONT_SIZE * 2);
    this.newLineFontSize = DEFAULT_NEW_LINE_FONT_SIZE * 2;
  }

  bold(isBold) {
    this.fontBold = isBold;
  }

  italic(isItalic) {
    this.fontItalic = isItalic;
  }

  setTextNormal() {
    this.fontSize = DEFAULT_FONT_SIZE;
    this.newLineFontSize = DEFAULT_NEW_LINE_FONT_SIZE;
    this.bold(false);
    this.italic(false);
  }

  invert() {
    // will be implemented later
  }

  setFontSize(fontSize) {
    this.fontSize = fontSize;
  }

  newLine(customNewLineFontSize) {
    const currentFontSize = this.fontSize;
    this.fontSize = customNewLineFontSize || this.newLineFontSize;

    const {height: paragraphHeight} = this._drawParagraph('\n', this.currentPrintX, this.currentPrintY, this.printWidth);
    this._increasePrintY(paragraphHeight);
    this.fontSize = currentFontSize
  }

  drawLine() {
    this._increasePrintY(DEFAULT_FONT_SIZE);
    const y = this.currentPrintY - DEFAULT_FONT_SIZE / 2;

    this.canvasContext.fillStyle = "black";
    this.canvasContext.drawLine({start: {x: 0, y}, end: {x: this.canvasWidth, y}});
  }

  tableCustom(columns) {
    const currentPrintX = this.currentPrintX;

    // for fixing a bug of canvas-txt relating to paragraph width < single character width, causing infinite while loop
    // this variable is for ensuring total paragraph width doesn't become larger than canvas width
    let totalParagraphWidthExtension = 0;

    const heights = [];

    for (let i = 0; i < columns.length; i++) {
      const column = columns[i];

      let {text, align, width} = column;

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
    }

    const maxHeight = heights.sort((e1, e2) => e2 - e1)[0];
    this._increasePrintY(maxHeight);
    this.currentPrintX = currentPrintX;
  }

  leftRight(leftText, rightText) {
    this.tableCustom([
      {text: leftText, align: 'LEFT', width: 0.5},
      {text: rightText, align: 'RIGHT', width: 0.5},
    ])
  }

  println(text) {
    const {height: paragraphHeight} = this._drawParagraph(text, this.currentPrintX, this.currentPrintY, this.printWidth);
    this._increasePrintY(paragraphHeight);
  }

  _canvasToPngBuffer(canvas, customHeight) {
    return new Promise(async resolve => {
      let canvasImageBuffer = Buffer.from([]);
      const originalCanvasHeight = canvas.height;
      if (!isNaN(customHeight)) canvas.height = customHeight;

      const writeStream = new Writable();
      writeStream._write = function (chunk, encoding, cb) {
        canvasImageBuffer = Buffer.concat([canvasImageBuffer, chunk]);
        cb();
      }
      writeStream.on('finish', async () => {
        canvas.height = originalCanvasHeight;
        resolve(canvasImageBuffer);
      });
      await PureImage.encodePNGToStream(canvas, writeStream);
    });
  }

  async printToFile(outputFilePath) {
    const pngBuffer = await this._canvasToPngBuffer(this.canvas, this.currentPrintY);

    fs.writeFileSync(path.resolve(outputFilePath), pngBuffer);
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
    this.fontSize = DEFAULT_FONT_SIZE;
    this.newLineFontSize = DEFAULT_NEW_LINE_FONT_SIZE;
    this.bold(false);
    this.italic(false);

    // align left (default)
    this.textAlign = 'left';

    // shrink canvas & fill with white
    this._shrinkCanvasHeight();
    this._fillCanvasWithWhite();
  }

  printQrCode(text) {
    if (typeof text !== 'string') text = text.toString();

    return new Promise(resolve => {
      let qrBinData = Buffer.from([]);

      const writeStream = new Writable();
      writeStream._write = function (chunk, encoding, cb) {
        qrBinData = Buffer.concat([qrBinData, chunk]);
        cb();
      }
      writeStream.on('finish', () => {
        // this.printImage(qrBinData).then(resolve);

        /* because we use queue to execute functions, .then is no longer needed
        printImage is pushed to the head of the execution queue before printQrCode resolves
        -> will be executed before any other functions */
        this.printImage(qrBinData);
        resolve();
      });

      QRCode.toFileStream(writeStream, text);
    });
  }

  async printBarcode(text, opts = {}) {
    const {height = 80, width = 3.5, displayValue = false} = opts;

    let canvas = PureImage.make(this.printWidth, height + 10, {});
    let canvasContext = canvas.getContext('2d');

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
    this.printImage(barcodeImageBuffer).then(() => {
      canvasContext = null;
      canvas.data = null;
      canvas = null;
    });
  }

  async printImage(imageInput) {
    let imageX = this.currentPrintX;
    let imageData;

    if (typeof imageInput === 'string') {
      imageData = await PureImage.decodePNGFromStream(fs.createReadStream(imageInput));
    } else if (imageInput instanceof Buffer) {
      const imageReadStream = new Readable();
      imageReadStream.push(imageInput);
      imageReadStream.push(null);
      imageData = await PureImage.decodePNGFromStream(imageReadStream);
    }

    const {width: imgWidth, height: imgHeight} = imageData;

    switch (this.textAlign) {
      case 'left': {
        imageX = this.currentPrintX;
        break;
      }
      case 'right': {
        imageX = this.currentPrintX + this.printWidth - imgWidth;
        break;
      }
      case 'center': {
        imageX = this.canvasWidth / 2 - imgWidth / 2;
        break
      }
    }

    this.canvasContext.drawImage(imageData,
      0, 0, imgWidth, imgHeight,                      // source dimensions
      imageX, this.currentPrintY, imgWidth, imgHeight // destination dimensions
    );

    this._increasePrintY(imgHeight);
  }

  _drawParagraph(text, x, y, layoutWidth) {
    if (typeof text !== 'string') text = text.toString();

    let fontFilePath;

    if (this.fontBold && this.fontItalic) {
      fontFilePath = this.fontFilePaths.boldItalic;
    } else if (this.fontBold) {
      fontFilePath = this.fontFilePaths.bold;
    } else if (this.fontItalic) {
      fontFilePath = this.fontFilePaths.italic;
    } else {
      fontFilePath = this.fontFilePaths.normal;
    }

    if (!this.currentFont || this.currentFont !== fontFilePath) {
      PureImage.registerFont(fontFilePath, this.fontFamily).loadSync();
      this.currentFont = fontFilePath;
    }

    CanvasTxt.align = this.textAlign;
    CanvasTxt.fontSize = this.fontSize;
    this.canvasContext.fillStyle = "black";
    const {height, width} = CanvasTxt.drawText(this.canvasContext, text, x, y, layoutWidth, this.fontSize);

    return {height, width};
  }

  _increasePrintY(value) {
    this.currentPrintY += value;
    this.currentPrintY = Math.round(this.currentPrintY);

    if (this.currentPrintY + CANVAS_HEIGHT_RESIZING_REMAINING >= this.canvas.height) {
      this.canvas.height += CANVAS_HEIGHT_EXTENSION;

      const width = Math.floor(this.canvasWidth);
      const height = Math.floor(CANVAS_HEIGHT_EXTENSION);

      const bufferToAppend = Buffer.alloc(Math.ceil(width * height / 8), 255);

      this.canvas.data = Buffer.concat([this.canvas.data, bufferToAppend]);
    }
  }

  _fillCanvasWithWhite(canvas = this.canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height, 0xffffffff);
  }

  _shrinkCanvasHeight() {
    this.canvas.height = DEFAULT_CANVAS_HEIGHT;
    const newBufferSize = Math.floor(this.canvasWidth) * this.canvas.height * 4;
    this.canvas.data = this.canvas.data.slice(0, newBufferSize);
    this.currentPrintX = 0;
    this.currentPrintY = 0;
  }

  cleanup() {
    if (this.canvas) {
      this._shrinkCanvasHeight();
      this._fillCanvasWithWhite();
    }

    this.canvasContext = null;
    this.canvas = null;
  }
}

module.exports = PureImagePrinter;

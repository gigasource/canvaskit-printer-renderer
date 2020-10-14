const PureImage = require('pureimage');
const uint32 = require('pureimage/src/uint32');
const path = require('path');
const fs = require('fs');
const CanvasTxt = require('./canvas-txt');
const Jimp = require('jimp');
const {Readable, Writable} = require('stream');
const {PNG} = require('pngjs');
const QRCode = require('qrcode');
const JsBarcode = require('jsbarcode');

const DEFAULT_CANVAS_WIDTH = 560;
const DEFAULT_CANVAS_HEIGHT = 2000;
const DEFAULT_FONT_SIZE = 24;
const DEFAULT_NEW_LINE_FONT_SIZE = 4;
const DEFAULT_FONT = 'Verdana';

// the resizing amount, example: 2500 + CANVAS_HEIGHT_EXTENSION + CANVAS_HEIGHT_EXTENSION...
const CANVAS_HEIGHT_EXTENSION = 1000;
// example: canvas height is 2500, if printY >= canvas height - CANVAS_HEIGHT_RESIZING_REMAINING (=2000) then resizing will happen
const CANVAS_HEIGHT_RESIZING_REMAINING = 500;

let canvas = PureImage.make(DEFAULT_CANVAS_WIDTH, DEFAULT_CANVAS_HEIGHT, {});
let canvasContext = canvas.getContext('2d');

class PureImagePrinter {
  constructor(width = DEFAULT_CANVAS_WIDTH, ...args) {
    // print functions from pos-restaurant, used for backward compatibility
    let opts = {};

    if (typeof args[0] === 'object') opts = args[0];
    else if (typeof args[1] === 'object') opts = args[1]; // backward compatibility;

    const {printFunctions = {}} = opts;
    this.externalPrintPng = printFunctions.printPng;
    this.externalPrint = printFunctions.print;
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
    this.fontFilePaths = {
      normal: path.resolve(__dirname + `/../assets/fonts/${this.fontFamily}.ttf`),
      bold: path.resolve(__dirname + `/../assets/fonts/${this.fontFamily}_Bold.ttf`),
      italic: path.resolve(__dirname + `/../assets/fonts/${this.fontFamily}_Italic.ttf`),
      boldItalic: path.resolve(__dirname + `/../assets/fonts/${this.fontFamily}_Bold_Italic.ttf`),
    }

    if (width !== canvas.width) {
      canvas = PureImage.make(width, DEFAULT_CANVAS_HEIGHT, {});
      canvasContext = canvas.getContext('2d');
    }

    this.canvas = canvas;
    this.canvasContext = canvasContext;

    this.canvasContext.fillStyle = 'white';
    this.canvasContext.fillRect(0, 0, canvas.width, canvas.height);
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
    this.println('\n');
    this.fontSize = currentFontSize;
  }

  drawLine() {
    // this.currentPrintY += DEFAULT_FONT_SIZE;
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

    const heights = columns.map((column, index) => {
      // NOTE: use for loop if this uses async function, this requires functions being executed sequentially
      let {text, align, width} = column;

      if (width < 0) width = 0;
      else if (width > 1) width = 1.0;

      let paragraphLayoutWidth = this.printWidth * width;
      const currentTextAlign = this.textAlign;

      if (index === columns.length - 1 && totalParagraphWidthExtension > 0) {
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
      return paragraphHeight;
    });

    const maxHeight = heights.sort((e1, e2) => e2 - e1)[0];
    // this.currentPrintY += maxHeight;
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
    // this.currentPrintY += paragraphHeight;
    this._increasePrintY(paragraphHeight);
  }

  async _canvasToPngBuffer(canvas) {
    return new Promise(async resolve => {
      let canvasImageBuffer = Buffer.from([]);

      const writeStream = new Writable();
      writeStream._write = function (chunk, encoding, cb) {
        canvasImageBuffer = Buffer.concat([canvasImageBuffer, chunk]);
        cb();
      }
      writeStream.on('finish', async () => {
        resolve(canvasImageBuffer);
      });
      await PureImage.encodePNGToStream(canvas, writeStream);
    });
  }

  async _getPrintPngBuffer() {
    const canvasImageBuffer = await this._canvasToPngBuffer(this.canvas);
    const jimpImg = await Jimp.read(canvasImageBuffer);
    jimpImg.crop(0, 0, this.canvasWidth, this.currentPrintY);

    return jimpImg.getBufferAsync(Jimp.MIME_PNG)
  }

  async printToFile(outputFilePath) {
    const pngBuffer = await this._getPrintPngBuffer();

    fs.writeFileSync(path.resolve(outputFilePath), pngBuffer);
  }

  async print() {
    const pngBuffer = await this._getPrintPngBuffer();
    const png = PNG.sync.read(pngBuffer);

    if (typeof this.externalPrintPng === 'function' && typeof this.externalPrint === 'function') {
      this.externalPrintPng(png);
      await this.externalPrint();
    }
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
        this.printImage(qrBinData).then(resolve);
      });

      QRCode.toFileStream(writeStream, text);
    });
  }

  async printBarcode(text, opts = {}) {
    const {height = 80, width = 3.5, displayValue = false} = opts;

    const canvas = PureImage.make(this.printWidth, height + 10, {});
    const canvasContext = canvas.getContext('2d');

    canvasContext.fillStyle = 'white';
    canvasContext.fillRect(0, 0, this.printWidth, height);

    JsBarcode(canvas, text, {
      height,
      width,
      displayValue,
      marginLeft: 0,
      marginRight: 0,
      ...opts,
    });

    const barcodeImageBuffer = await this._canvasToPngBuffer(canvas);
    await this.printImage(barcodeImageBuffer);
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

    // this.currentPrintY += imgHeight;
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

    const fontLoader = PureImage.registerFont(fontFilePath, this.fontFamily);

    fontLoader.loadSync();

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

      const bufferToAppend = Buffer.alloc(width * height * 4);

      const color = 0xffffffff // white background
      for (let j = 0; j < height; j++) {
        for (let i = 0; i < width; i++) {
          setPixelRGBA(i, j, color);
        }
      }

      this.canvas.data = Buffer.concat([this.canvas.data, bufferToAppend]);

      function calculateIndex(x, y) {
        x = Math.floor(x);
        y = Math.floor(y);
        if (x < 0 || y < 0 || x >= width || y >= height) return 0;
        return (width * y + x) * 4;
      }

      function setPixelRGBA(x, y, rgba) {
        let i = calculateIndex(x, y);
        const bytes = uint32.getBytesBigEndian(rgba);
        bufferToAppend[i] = bytes[0];
        bufferToAppend[i + 1] = bytes[1];
        bufferToAppend[i + 2] = bytes[2];
        bufferToAppend[i + 3] = bytes[3];
      }
    }
  }

  cleanup() {
    this.canvasContext = null;
    this.canvas = null;
  }
}

module.exports = PureImagePrinter;

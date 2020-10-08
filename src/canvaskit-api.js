const canvaskitFilePath = 'canvaskit-wasm/bin/canvaskit.js';
const CanvaskitInit = require(canvaskitFilePath);
const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const QRCode = require('qrcode');
const imageSizeOf = require('image-size');
const {Writable} = require('stream');
const {PNG} = require('pngjs');
/*const JsBarcode = require('jsbarcode');
const {createCanvas} = require('canvas');*/

const DEFAULT_FONT_SIZE = 24;
const DEFAULT_NEW_LINE_FONT_SIZE = 4;
const DEFAULT_FONT = 'Verdana';
let Canvaskit;

const fonts = {
  default: path.resolve(__dirname + '/../assets/fonts/Verdana.ttf'),
  b: path.resolve(__dirname + '/../assets/fonts/Verdana_Bold.ttf'),
  i: path.resolve(__dirname + '/../assets/fonts/Verdana_Italic.ttf'),
  bi: path.resolve(__dirname + '/../assets/fonts/Verdana_Bold_Italic.ttf'),
};

async function initCanvaskit() {
  Canvaskit = await CanvaskitInit({
    locateFile: (file) => path.dirname(require.resolve(canvaskitFilePath)) + '/' + file,
  });

  return CanvaskitApi;
}

class CanvaskitApi {
  constructor(width = 560, height = 15000, opts = {}) {
    // print functions from pos-restaurant, used for backward compatibility
    const {printFunctions = {}} = opts;
    this.externalPrintPng = printFunctions.printPng;
    this.externalPrint = printFunctions.print;

    this.textAlign = Canvaskit.TextAlign.Left;
    this.fontWeight = Canvaskit.FontWeight.Normal;
    this.fontSize = DEFAULT_FONT_SIZE;
    this.fontName = DEFAULT_FONT;
    this.fontData = [
      fs.readFileSync(fonts.default),
      fs.readFileSync(fonts.b),
      fs.readFileSync(fonts.i),
      fs.readFileSync(fonts.bi)
    ];
    this.textColor = Canvaskit.BLACK;
    this.newLineFontSize = DEFAULT_NEW_LINE_FONT_SIZE;

    this.canvasWidth = width;
    this.canvasHeight = height;
    this.paddingHorizontal = 0;
    this.paddingVertical = 0;
    this.printWidth = this.canvasWidth - this.paddingHorizontal * 2;

    this.currentPrintX = this.paddingHorizontal;
    this.currentPrintY = this.paddingVertical;

    this.surface = Canvaskit.MakeSurface(width, height);
    this.surfaceCanvas = this.surface.getCanvas();
    this.surfaceCanvas.clear(Canvaskit.Color(255, 255, 255, 1.0));
  }

  alignLeft() {
    this.textAlign = Canvaskit.TextAlign.Left;
  }

  alignRight() {
    this.textAlign = Canvaskit.TextAlign.Right;
  }

  alignCenter() {
    this.textAlign = Canvaskit.TextAlign.Center;
  }

  setTextDoubleHeight() {
    this.fontSize = DEFAULT_FONT_SIZE * 2;
    this.newLineFontSize = DEFAULT_NEW_LINE_FONT_SIZE * 2;
  }

  setTextDoubleWidth() {
    this.fontSize = DEFAULT_FONT_SIZE;
    this.newLineFontSize = DEFAULT_NEW_LINE_FONT_SIZE;
  }

  setTextQuadArea() {
    this.fontSize = DEFAULT_FONT_SIZE * 2;
    this.newLineFontSize = DEFAULT_NEW_LINE_FONT_SIZE * 2;
  }

  bold(isBold) {
    this.fontWeight = isBold ? Canvaskit.FontWeight.Bold : Canvaskit.FontWeight.Normal;
  }

  setTextNormal() {
    this.fontSize = DEFAULT_FONT_SIZE;
    this.newLineFontSize = DEFAULT_NEW_LINE_FONT_SIZE;
    this.bold(false);
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
    const paint = new Canvaskit.SkPaint();
    paint.setColor(Canvaskit.Color(0, 0, 0, 1.0));
    paint.setAntiAlias(true);

    this.currentPrintY += DEFAULT_FONT_SIZE;
    const y = this.currentPrintY - DEFAULT_FONT_SIZE / 2;

    this.surfaceCanvas.drawLine(this.currentPrintX, y, this.printWidth + this.currentPrintX, y, paint);
    this.surface.flush();

    paint.delete();
  }

  tableCustom(columns) {
    const currentPrintX = this.currentPrintX;

    const heights = columns.map(column => {
      let {text, align, width} = column;

      if (width < 0) width = 0;
      else if (width > 1) width = 1.0;

      const paragraphLayoutWidth = this.printWidth * width;
      const currentTextAlign = this.textAlign;

      if (align.toUpperCase() === 'LEFT') this.textAlign = Canvaskit.TextAlign.Left;
      else if (align.toUpperCase() === 'RIGHT') this.textAlign = Canvaskit.TextAlign.Right;
      else if (align.toUpperCase() === 'CENTER') this.textAlign = Canvaskit.TextAlign.Center;

      const paragraphHeight = this._drawParagraph(text, this.currentPrintX, this.currentPrintY, paragraphLayoutWidth);
      this.currentPrintX += paragraphLayoutWidth;

      this.textAlign = currentTextAlign;
      return paragraphHeight;
    });

    const maxHeight = heights.sort((e1, e2) => e2 - e1)[0];
    this.currentPrintY += maxHeight;
    this.currentPrintX = currentPrintX;
  }

  leftRight(leftText, rightText) {
    this.tableCustom([
      {text: leftText, align: 'LEFT', width: 0.5},
      {text: rightText, align: 'RIGHT', width: 0.5},
    ])
  }

  println(text) {
    const paragraphHeight = this._drawParagraph(text, this.currentPrintX, this.currentPrintY, this.printWidth);
    this.currentPrintY += paragraphHeight;
  }

  async _getPrintPngBuffer() {
    const img = this.surface.makeImageSnapshot();
    const png = img.encodeToData();

    const pngBuffer = Buffer.from(Canvaskit.getSkDataBytes(png));

    const jimpImg = await Jimp.read(pngBuffer);
    jimpImg.crop(0, 0, this.canvasWidth, this.currentPrintY);

    return jimpImg.getBufferAsync(Jimp.MIME_PNG);
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
        this.printImage(qrBinData);
        resolve();
      });

      QRCode.toFileStream(writeStream, text);
    });
  }

  printBarcode(text, opts = {}) {
/*    const canvas = createCanvas();
    JsBarcode(canvas, text, {
      height: opts.height || 80,
      width: opts.width || 3.5,
      displayValue: opts.displayValue || false,
      ...opts,
    });

    const barcodeImageBuffer = canvas.toBuffer('image/png');
    this.printImage(barcodeImageBuffer);*/
  }

  /**
   * @param imageInput can be a String (image file path) or Buffer(image binary data)
   */
  printImage(imageInput) {
    const paint = new Canvaskit.SkPaint();
    paint.setColor(Canvaskit.Color(0, 0, 0, 1.0));
    paint.setAntiAlias(true);
    let imageBuffer;
    let imageX = this.currentPrintX;

    if (typeof imageInput === 'string') {
      const absoluteFilePath = path.resolve(imageInput);
      imageBuffer = fs.readFileSync(absoluteFilePath);
    } else if (imageInput instanceof Buffer) {
      imageBuffer = imageInput;
    }

    const {width: imgWidth, height: imgHeight} = imageSizeOf(imageBuffer);

    switch (this.textAlign) {
      case Canvaskit.TextAlign.Left: {
        imageX = this.currentPrintX;
        break;
      }
      case Canvaskit.TextAlign.Right: {
        imageX = this.currentPrintX + this.printWidth - imgWidth;
        break;
      }
      case Canvaskit.TextAlign.Center: {
        imageX = this.canvasWidth / 2 - imgWidth / 2;
        break
      }
    }

    const skImage = Canvaskit.MakeImageFromEncoded(imageBuffer);
    this.surfaceCanvas.drawImage(skImage, imageX, this.currentPrintY, paint);

    this.currentPrintY += imgHeight;
    paint.delete();
  }

  _drawParagraph(text, x, y, layoutWidth) {
    if (typeof text !== 'string') text = text.toString();

    const fontMgr = Canvaskit.SkFontMgr.FromData(this.fontData);

    const canvasParagraph = new Canvaskit.ParagraphStyle({
      textStyle: {
        color: this.textColor,
        fontFamilies: [this.fontName],
        fontSize: this.fontSize,
        fontStyle: {
          weight: this.fontWeight,
        }
      },
      textAlign: this.textAlign,
    });

    const paragraphBuilder = Canvaskit.ParagraphBuilder.Make(canvasParagraph, fontMgr);
    paragraphBuilder.addText(text);
    const paragraph = paragraphBuilder.build();
    paragraph.layout(layoutWidth);

    this.surfaceCanvas.drawParagraph(paragraph, x, y);

    const paragraphHeight = paragraph.getHeight();
    paragraph.delete();

    this.surface.flush();
    return paragraphHeight;
  }

  cleanup() {
    this.surface.dispose();
  }

  /*  // NOTE: this function will dispose of old canvas and create a new one with specified dimensions
    setWidth(width) {
      if (isNaN(width)) throw new Error('width must be a Number');

      /!*this.canvas.dispose();
      this.canvas = Canvaskit.MakeCanvas(width, height);*!/
      this.canvas.Ll.jm = width;
      this.canvas.Ll.im = width * this.canvas.Ll.fm * 4;
    }

    setHeight(height) {
      if (isNaN(height)) throw new Error('height must be a Number');

      /!*this.canvas.dispose();
      this.canvas = Canvaskit.MakeCanvas(width, height);*!/
      this.canvas.Ll.fm = height;
      this.canvas.Ll.im = this.canvas.Ll.jm * height * 4;
    }*/
}

module.exports = initCanvaskit;

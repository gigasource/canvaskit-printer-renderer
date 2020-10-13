const PureImagePrinter = require('./src/pure-image-api');
const pureImagePrinter = new PureImagePrinter(560);

const path = require('path');

(async () => {
  pureImagePrinter.alignCenter();
  await pureImagePrinter.printImage(path.resolve(`${__dirname}/logo.png`));
  pureImagePrinter.newLine();
  pureImagePrinter.setFontSize(14);
  pureImagePrinter.println('ANOKI RESTAURANT');
  pureImagePrinter.println('Maximilanstrabe 2 / Hofgraben 9');
  pureImagePrinter.println('80859 Munchen');
  pureImagePrinter.println('Tel: 089 413 275 60');
  pureImagePrinter.println('St.-Nr: 143/147/31337');
  pureImagePrinter.newLine();

  pureImagePrinter.alignLeft();
  pureImagePrinter.setTextQuadArea();
  pureImagePrinter.bold(true);
  pureImagePrinter.println('Rechnung');
  pureImagePrinter.println('Datum: 21.09.2020 13:45');
  pureImagePrinter.println('Tisch: 63');
  pureImagePrinter.bold(false);
  pureImagePrinter.drawLine();

  pureImagePrinter.setFontSize(14);
  pureImagePrinter.tableCustom([
    {text: 'Qty', align: 'LEFT', width: 0.1},
    {text: 'Bezeichnung', align: 'LEFT', width: 0.5},
    {text: 'EP', align: 'LEFT', width: 0.1},
    {text: 'Preis', align: 'RIGHT', width: 0.3},
  ]);
  pureImagePrinter.tableCustom([
    {text: '1', align: 'LEFT', width: 0.1},
    {text: 'Whiskey Sour', align: 'LEFT', width: 0.5},
    {text: '', align: 'LEFT', width: 0.1},
    {text: '12,80', align: 'RIGHT', width: 0.3},
  ]);
  pureImagePrinter.tableCustom([
    {text: '1', align: 'LEFT', width: 0.1},
    {text: 'Pisco Sour', align: 'LEFT', width: 0.5},
    {text: '', align: 'LEFT', width: 0.1},
    {text: '12,80', align: 'RIGHT', width: 0.3},
  ]);
  pureImagePrinter.drawLine();

  pureImagePrinter.setTextQuadArea();
  pureImagePrinter.bold(true);
  pureImagePrinter.leftRight('Summe', '$ 25.60');
  pureImagePrinter.drawLine();

  pureImagePrinter.setFontSize(14);
  pureImagePrinter.bold(false);
  pureImagePrinter.leftRight('Netto', '22,07');
  pureImagePrinter.leftRight('16% MwSt:', '3,53');
  pureImagePrinter.newLine();

  pureImagePrinter.tableCustom([
    {text: 'TSE-Serienummer:', align: 'LEFT', width: 0.5},
    {text: '2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217', align: 'LEFT', width: 0.5},
  ]);
  pureImagePrinter.tableCustom([
    {text: 'TSE-Signature:', align: 'LEFT', width: 0.5},
    {text: '2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217', align: 'LEFT', width: 0.5},
  ]);
  pureImagePrinter.newLine();

  pureImagePrinter.alignCenter();
  await pureImagePrinter.printQrCode('2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217');
  await pureImagePrinter.printBarcode('201005103450367', {
    height: 80, // default is 80
    width: 3.5, // width of each bar in barcode
    displayValue: false, // display text value below the barcode or not, default is false
  });
  pureImagePrinter.println('Value: 201005103450367');
  pureImagePrinter.newLine();

  pureImagePrinter.setTextQuadArea();
  pureImagePrinter.alignLeft();
  pureImagePrinter.bold(true);
  pureImagePrinter.println('Vielen Dank fur Ihren Besuch!');

  pureImagePrinter.printToFile(path.resolve(`${__dirname}/example.png`)).then(() => {
    console.log('Printed');
    pureImagePrinter.cleanup();
    showMemUsage();
  });

  setInterval(() => {
    showMemUsage();
  }, 5000)
})()

function showMemUsage() {
  const memUsage = process.memoryUsage();
  console.log(Object.keys(memUsage).reduce((acc, cur) => {
    acc[cur] = memUsage[cur] / (1024 * 1024);
    return acc;
  }, {}));
}

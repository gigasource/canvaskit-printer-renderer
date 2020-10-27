const PureImagePrinter = require('./');

const path = require('path');

(async () => {
  async function printWithInstance(instanceName) {
    const pureImagePrinter = new PureImagePrinter();
    console.time(instanceName);
    await pureImagePrinter.alignCenter();
    await pureImagePrinter.printImage(path.resolve(`${__dirname}/logo.png`));
    await pureImagePrinter.newLine();
    await pureImagePrinter.setFontSize(14);
    await pureImagePrinter.println('A RESTAURANT NAME');
    await pureImagePrinter.println('Maximilanstrabe 222 / Hofgraben 999');
    await pureImagePrinter.println('88888 Munchen');
    await pureImagePrinter.println('Tel: 012 456 234 67');
    await pureImagePrinter.println('St.-Nr: 147/174/33333');
    await pureImagePrinter.newLine();

    await pureImagePrinter.alignLeft();
    await pureImagePrinter.setTextQuadArea();
    await pureImagePrinter.bold(true);
    await pureImagePrinter.println('Rechnung' + instanceName);
    await pureImagePrinter.println('Datum: 21.09.2020 13:45');
    await pureImagePrinter.println('Tisch: 63');
    await pureImagePrinter.bold(false);
    await pureImagePrinter.drawLine();

    await pureImagePrinter.setFontSize(14);
    await pureImagePrinter.tableCustom([
      {text: 'Qty', align: 'LEFT', width: 0.1},
      {text: 'Bezeichnung', align: 'LEFT', width: 0.5},
      {text: 'EP', align: 'LEFT', width: 0.1},
      {text: 'Preis', align: 'RIGHT', width: 0.3},
    ]);
    await pureImagePrinter.tableCustom([
      {text: '1', align: 'LEFT', width: 0.1},
      {text: 'Whiskey Sour', align: 'LEFT', width: 0.5},
      {text: '', align: 'LEFT', width: 0.1},
      {text: '12,80', align: 'RIGHT', width: 0.3},
    ]);
    await pureImagePrinter.tableCustom([
      {text: '1', align: 'LEFT', width: 0.1},
      {text: 'Pisco Sour', align: 'LEFT', width: 0.5},
      {text: '', align: 'LEFT', width: 0.1},
      {text: '12,80', align: 'RIGHT', width: 0.3},
    ]);
    await pureImagePrinter.drawLine();

    await pureImagePrinter.setTextQuadArea();
    await pureImagePrinter.bold(true);
    await pureImagePrinter.leftRight('Summe', '$ 25.60');
    await pureImagePrinter.drawLine();

    await pureImagePrinter.setFontSize(14);
    await pureImagePrinter.bold(false);
    await pureImagePrinter.leftRight('Netto', '22,07');
    await pureImagePrinter.leftRight('16% MwSt:', '3,53');
    await pureImagePrinter.newLine();

    await pureImagePrinter.tableCustom([
      {text: 'TSE-Serienummer:', align: 'LEFT', width: 0.5},
      {text: '2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217', align: 'LEFT', width: 0.5},
    ]);
    await pureImagePrinter.tableCustom([
      {text: 'TSE-Signature:', align: 'LEFT', width: 0.5},
      {text: '2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217', align: 'LEFT', width: 0.5},
    ]);
    await pureImagePrinter.newLine();

    await pureImagePrinter.alignCenter();
    await pureImagePrinter.printQrCode('2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217');
    await pureImagePrinter.printBarcode('201005103450367', {
      height: 80, // default is 80
      width: 3.5, // width of each bar in barcode
      displayValue: false, // display text value below the barcode or not, default is false
    });
    await pureImagePrinter.println('Value: 201005103450367');
    await pureImagePrinter.newLine();

    await pureImagePrinter.setTextQuadArea();
    await pureImagePrinter.alignLeft();
    await pureImagePrinter.bold(true);
    await pureImagePrinter.println('Vielen Dank fur Ihren Besuch!');

    await pureImagePrinter.printToFile(path.resolve(`${__dirname}/example${instanceName}.png`)).then(async () => {
      console.timeEnd(instanceName);
      console.log('Printed');
      await pureImagePrinter.cleanup();
    });
  }

  setTimeout(() => printWithInstance('1'), 1000);
  setTimeout(() => printWithInstance('2'), 2000);
  setTimeout(() => printWithInstance('3'), 3000);
  setTimeout(() => printWithInstance('4'), 4000);
  // setTimeout(() => printWithInstance('5'), 5000);
  // setTimeout(() => printWithInstance('6'), 6000);
  // setTimeout(() => printWithInstance('7'), 7000);
  // setTimeout(() => printWithInstance('8'), 8000);
})()

function showMemUsage() {
  const memUsage = process.memoryUsage();
  console.log(Object.keys(memUsage).reduce((acc, cur) => {
    acc[cur] = memUsage[cur] / (1024 * 1024);
    return acc;
  }, {}));
}

setInterval(() => {
  showMemUsage();
}, 5000)

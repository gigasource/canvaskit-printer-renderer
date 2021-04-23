const PureImagePrinter = require('./');

const path = require('path');

(async () => {
  async function printWithInstance(instanceName) {
    const pureImagePrinter = new PureImagePrinter(500);
    console.time(instanceName);
    await pureImagePrinter.marginTop(4)
    await pureImagePrinter.drawLine()
    await pureImagePrinter.alignCenter();
    await pureImagePrinter.println('duong')
    // await pureImagePrinter.printImage(path.resolve(`${__dirname}/logo.png`));

    // const base64Image="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ZZ45JArTFHVxyumqhJbT1NtGnaAeMa94ZjFTUStTTk8/fP/ppx5iD5hOAhVtndXSsfR6w4pnFmMVdUn/zyv9P78jfWA/e0BHvLW+iVLUmGXbIhiuqMvpJx+iipqQvjfVkwhFqWa2zZ+j+zVPLyRCUctdRvr5nQNbn2QPCKDoP6C30ieQJChKnW37wja9dsMHJimKuqTf29+/9s7066+wBwwi9c45bMogqKddsnCB2Z0tQ7IUdRnY+Xz/mjv97UaKvBgGxlRFqWZ2LF1s5JptcZKoqAs1vf3/dr8/UXUg9a5pipKc1NZq8RATGSRXURfzRDVJ0eSsCRUh6Yq6DGx5sv/f77ePaiJq0a7bDEWpcrbNa22d9ZemXu30DhQdRjNRC5B6T29FE97W8kBRFhL19JYnxa/6Fi19AtFX0SkNE2fPaIGcDFA0P6To6S1PkavsgcIEdVDwv3/qgH6KkpYkZ6IupXgHihaDmt7TTlF9arj7DSpiZNQdOJtNqQr1tLNnXt06syUhmxCCAUU9MbDjeRKVfrIH1KPufQ0UbW5qvGbm1Qm8yBkAKOoDqqWuq+n31N2Xr7Ki7jotmYmy6R0oGgRS9PSzTlGNefk3X9etoKIkJGlJPa1Gz4BXBygaClVczaHuA1UUhZlCgKJiSL+7n0Qd2PECfWCPeSFfPQxG7IqSkFc1XUFywkwhQFHB2H3HydX0vled0toXwx2qdR/GoGhV5ejm6Y2TL5s4tWEi5pligaISoYqa3vfKwOt76Kc0XdmvLzJFScupDZMm119KP1Ew5QFFI8LRlYJ0zXxgD4uj7qOz2JQ4SMVL6sZTtaSf0DIaoGg8DFBdffft9NHD9JM+s4dDIFbRKQ0TL0ldVFP9FfqJ3T+xAEWVgNpgKq2kq33iOM1jKTPwq4De1h0MqKhr4JT6idTBkpC1NRdgVqkCUFRpXFFtKrZHj2Q+HMle3XGtzv2PXfIqSk1pVdXgXV1ja8bUVF9AH2qrx4zNSIjyqDJQFAClMeG1SwAYzP8DPH/cEGGL5lEAAAAASUVORK5CYIIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA="
    // await pureImagePrinter.newLine()
    // await pureImagePrinter.printImage(base64Image, 'base64')
    await pureImagePrinter.newLine();
    // await pureImagePrinter.setFontSize(14);
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

    // await pureImagePrinter.invert(true)
    //
    // await pureImagePrinter.tableCustom([
    //   {text: 'TSE-Serienummer:', align: 'LEFT', width: 0.5},
    //   {text: '2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217', align: 'LEFT', width: 0.5},
    // ]);
    // await pureImagePrinter.tableCustom([
    //   {text: 'TSE-Signature:', align: 'LEFT', width: 0.5},
    //   {text: '2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217', align: 'LEFT', width: 0.5},
    // ]);
    // await pureImagePrinter.invert(false)
    //
    // await pureImagePrinter.newLine();
    //
    // await pureImagePrinter.alignCenter();
    // await pureImagePrinter.printQrCode('2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217');
    // await pureImagePrinter.printBarcode('201005103450367', {
    //   height: 80, // default is 80
    //   width: 3.5, // width of each bar in barcode
    //   displayValue: false, // display text value below the barcode or not, default is false
    // });
    // await pureImagePrinter.invert(true)
    // await pureImagePrinter.println('Value: 201005103450367');
    // await pureImagePrinter.invert(false)
    // await pureImagePrinter.newLine();
    //
    // await pureImagePrinter.setTextQuadArea();
    // await pureImagePrinter.alignLeft();
    // await pureImagePrinter.bold(true)
    // await pureImagePrinter.invert(true)
    // await pureImagePrinter.println('Vielen Dank fur Ihren Besuch');
    // await pureImagePrinter.invert(false)
    //
    // await pureImagePrinter.bold(true)
    // await pureImagePrinter.tableCustom([
    //   { text: 'one', width: 0.3, bold: false, align: 'LEFT'},
    //   { text: 'two', width: 0.3, bold: true, align: 'CENTER'},
    //   { text: 'three', width: 0.4, bold: false, align: 'RIGHT'},
    // ])
    // await pureImagePrinter.println('text should be bold')
    //
    // await pureImagePrinter.bold(false)
    // await pureImagePrinter.tableCustom([
    //   { text: 'one', width: 0.3, bold: false, align: 'LEFT'},
    //   { text: 'two', width: 0.3, bold: true, align: 'CENTER'},
    //   { text: 'three', width: 0.4, bold: false, align: 'RIGHT'},
    // ])
    // await pureImagePrinter.println('text should be normal')
    //
    // await pureImagePrinter.newLine()

    //test font
    await pureImagePrinter.println('Nguyễn Ngọc Dưỡng $€')
    await pureImagePrinter.bold(true)
    await pureImagePrinter.println('Nguyễn Ngọc Dưỡng $€')
    await pureImagePrinter.italic(true)
    await pureImagePrinter.bold(false)
    await pureImagePrinter.println('Nguyễn Ngọc Dưỡng $€')

    // await pureImagePrinter.setFontSize(24)
    await pureImagePrinter.println('duong nguyen')

    await pureImagePrinter.printToFile(path.resolve(`${__dirname}/example${instanceName}.png`)).then(async () => {
      console.timeEnd(instanceName);
      console.log('Printed');
      await pureImagePrinter.cleanup();
    });
  }

  setTimeout(() => printWithInstance('2'), 1000);
  // setTimeout(() => printWithInstance('2'), 2000);
  // setTimeout(() => printWithInstance('3'), 3000);
  // setTimeout(() => printWithInstance('4'), 4000);
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
//
// setInterval(() => {
//   showMemUsage();
// }, 5000)

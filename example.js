const PureImagePrinter = require('./index');
const {base64Image} = require("./example-material");

const path = require('path');
const pureImagePrinter = new PureImagePrinter(560);

(async () => {
  async function printWithInstance(instanceName) {
    console.time(instanceName);
    await pureImagePrinter.marginTop(4)
    await pureImagePrinter.drawLine()
    await pureImagePrinter.alignCenter();
    // await pureImagePrinter.println('duong')
    // await pureImagePrinter.printImage(path.resolve(`${__dirname}/logo1.png`));

    // await pureImagePrinter.newLine()
    await pureImagePrinter.printImage(base64Image, 'base64', 0.5)
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
    await pureImagePrinter.setFontSize(25);
    const colMetaData = [{align: 'LEFT', padding: 0.03}, {align: 'RIGHT', priority: 'HIGH', padding: 0.03}, {align: 'RIGHT', priority: 'HIGH', padding: 0.03}, {align: 'RIGHT', priority: 'HIGH'}]
    const rowMetaData = [{borderBottom: true}]
    const data = [
      [
        {text: 'Artikel', bold: true},
        {text: 'Menge', bold: true},
        {text: 'Preis', bold: true},
        {text: 'Brutto',  bold: true}
      ],
      [
        {text: 'MEAT DELI file uc ga 450g 89123123123'},
        {text: '1'},
        {text: '40.00'},
        {text: '40.00'},
      ],
      [
        {text: 'Tequila'},
        {text: '1'},
        {text: '43,000'},
        {text: '43,000'}
      ],
      [
        {text: 'Baijiu'},
        {text: '1'},
        {text: '120,000'},
        {text: '120,00'}
      ],
      [
        {text: 'Gin'},
        {text: '1'},
        {text: '1,000,000'},
        {text: '1,000,000'}
      ],
    ]
    await pureImagePrinter.advancedTableCustom({metaData: {rowMetaData, colMetaData}, data}, true)

    await pureImagePrinter.setTextQuadArea();
    await pureImagePrinter.bold(true);
    await pureImagePrinter.leftRight('Summe', '');
    await pureImagePrinter.drawLine();

    await pureImagePrinter.setFontSize(14);
    await pureImagePrinter.bold(false);
    await pureImagePrinter.leftRight('Netto', '22,07');
    await pureImagePrinter.leftRight('16% MwSt:', '3,53');
    await pureImagePrinter.newLine();

    await pureImagePrinter.invert(true)

    await pureImagePrinter.tableCustom([
      {text: 'TSE-Serienummer:', align: 'LEFT', width: 0.5},
      {text: '2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217', align: 'LEFT', width: 0.5},
    ]);
    await pureImagePrinter.tableCustom([
      {text: 'TSE-Signature:', align: 'LEFT', width: 0.5},
      {text: '2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217', align: 'LEFT', width: 0.5},
    ]);
    await pureImagePrinter.invert(false)

    await pureImagePrinter.newLine();

    await pureImagePrinter.alignCenter();
    await pureImagePrinter.printQrCode('2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217', 0.5);
    await pureImagePrinter.printBarcode('201005103450367', {
      height: 80, // default is 80
      width: 3.5, // width of each bar in barcode
      displayValue: false, // display text value below the barcode or not, default is false
    });
    await pureImagePrinter.invert(true)
    await pureImagePrinter.println('Value: 201005103450367');
    await pureImagePrinter.invert(false)
    await pureImagePrinter.newLine();

    await pureImagePrinter.setTextQuadArea();
    await pureImagePrinter.alignLeft();
    await pureImagePrinter.bold(true)
    await pureImagePrinter.invert(true)
    await pureImagePrinter.println('Vielen Dank fur Ihren Besuch');
    await pureImagePrinter.invert(false)

    await pureImagePrinter.bold(true)
    await pureImagePrinter.tableCustom([
      { text: 'one', width: 0.3, bold: false, align: 'LEFT'},
      { text: 'two', width: 0.3, bold: true, align: 'CENTER'},
      { text: 'three', width: 0.4, bold: false, align: 'RIGHT'},
    ])
    await pureImagePrinter.println('text should be bold')

    await pureImagePrinter.bold(false)
    await pureImagePrinter.tableCustom([
      { text: 'one', width: 0.3, bold: false, align: 'LEFT'},
      { text: 'two', width: 0.3, bold: true, align: 'CENTER'},
      { text: 'three', width: 0.4, bold: false, align: 'RIGHT'},
    ])
    await pureImagePrinter.println('text should be normal')

    await pureImagePrinter.newLine()

    //test font
    await pureImagePrinter.invert(true)
    await pureImagePrinter.println('Nguyễn Ngọc Dưỡng $€')
    await pureImagePrinter.invert(false)
    await pureImagePrinter.bold(true)
    await pureImagePrinter.println('Nguyễn Ngọc Dưỡng $€')
    await pureImagePrinter.italic(true)
    await pureImagePrinter.bold(false)
    await pureImagePrinter.println('Nguyễn Ngọc Dưỡng $€. Phố Duy Tân')

    await pureImagePrinter.leftRight('duongduongduongduongduongduongduongduongduongduongduongduongduongduongduongduong', 'nguyennguyennguyen')

    // await pureImagePrinter.setFontSize(24)
    await pureImagePrinter.println('duong nguyen')

    await pureImagePrinter.printToFile(path.resolve(`${__dirname}/example${instanceName}.png`)).then(async () => {
      console.timeEnd(instanceName);
      console.log('Printed');
      // await pureImagePrinter.cleanup();
    });
  }

  await printWithInstance('1')
  await printWithInstance('2')
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

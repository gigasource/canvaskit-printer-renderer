const initCanvaskit = require('./src/canvaskit-api');
const path = require('path');

initCanvaskit().then(async (CanvaskitApi) => {
  const canvaskitApi = new CanvaskitApi();

  canvaskitApi.alignCenter();
  canvaskitApi.printImage(path.resolve(`${__dirname}/logo.png`));
  canvaskitApi.newLine();
  canvaskitApi.setFontSize(14);
  canvaskitApi.println('ANOKI RESTAURANT');
  canvaskitApi.println('Maximilanstrabe 2 / Hofgraben 9');
  canvaskitApi.println('80859 Munchen');
  canvaskitApi.println('Tel: 089 413 275 60');
  canvaskitApi.println('St.-Nr: 143/147/31337');
  canvaskitApi.newLine();

  canvaskitApi.alignLeft();
  canvaskitApi.setTextQuadArea();
  canvaskitApi.bold(true);
  canvaskitApi.println('Rechnung');
  canvaskitApi.println('Datum: 21.09.2020 13:45');
  canvaskitApi.println('Tisch: 63');
  canvaskitApi.bold(false);
  canvaskitApi.drawLine();

  canvaskitApi.setFontSize(14);
  canvaskitApi.tableCustom([
    {text: 'Qty', align: 'LEFT', width: 0.1},
    {text: 'Bezeichnung', align: 'LEFT', width: 0.5},
    {text: 'EP', align: 'LEFT', width: 0.1},
    {text: 'Preis', align: 'RIGHT', width: 0.3},
  ]);
  canvaskitApi.tableCustom([
    {text: '1', align: 'LEFT', width: 0.1},
    {text: 'Whiskey Sour', align: 'LEFT', width: 0.5},
    {text: '', align: 'LEFT', width: 0.1},
    {text: '12,80', align: 'RIGHT', width: 0.3},
  ]);
  canvaskitApi.tableCustom([
    {text: '1', align: 'LEFT', width: 0.1},
    {text: 'Pisco Sour', align: 'LEFT', width: 0.5},
    {text: '', align: 'LEFT', width: 0.1},
    {text: '12,80', align: 'RIGHT', width: 0.3},
  ]);
  canvaskitApi.drawLine();

  canvaskitApi.setTextQuadArea();
  canvaskitApi.bold(true);
  canvaskitApi.leftRight('Summe', '$ 25.60');
  canvaskitApi.drawLine();

  canvaskitApi.setFontSize(14);
  canvaskitApi.bold(false);
  canvaskitApi.leftRight('Netto', '22,07');
  canvaskitApi.leftRight('16% MwSt:', '3,53');
  canvaskitApi.newLine();

  canvaskitApi.tableCustom([
    {text: 'TSE-Serienummer:', align: 'LEFT', width: 0.5},
    {text: '2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217', align: 'LEFT', width: 0.5},
  ]);
  canvaskitApi.tableCustom([
    {text: 'TSE-Signature:', align: 'LEFT', width: 0.5},
    {text: '2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217', align: 'LEFT', width: 0.5},
  ]);
  canvaskitApi.newLine();

  canvaskitApi.alignCenter();
  await canvaskitApi.printQrCode('2D49DCE478188FFB84B4F7B0735DF925436DCB23B64D2365FC0A62AB4DBE0217');
  canvaskitApi.newLine();

  canvaskitApi.setTextQuadArea();
  canvaskitApi.alignLeft();
  canvaskitApi.bold(true);
  canvaskitApi.println('Vielen Dank fur Ihren Besuch!');

  canvaskitApi.printToFile(path.resolve(`${__dirname}/example.png`)).then(() => {
    console.log('Printed');
    canvaskitApi.cleanup();
  });
});

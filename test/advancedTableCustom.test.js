const PureImagePrinter = require('../src/pure-image-printer');
const path = require('path');

const tableData = {
  "metaData": {
    "colMetaData": [
      {
        "align": "LEFT"
      },
      {
        "align": "RIGHT",
        "priority": "HIGH",
        "padding": 0.05
      },
      {
        "align": "RIGHT",
        "priority": "HIGH"
      }
    ],
    "rowMetaData": [
      {
        "borderBottom": true
      }
    ]
  },
  "data": [
    [
      { "text": "Product", "bold": true },
      { "text": "Qty", "bold": true },
      { "text": "Sum", "bold": true }
    ],
    [
      { "text": "1. Margherita Pizza" },
      { "text": "1" },
      { "text": "42.00" }
    ],
    [
      { "text": "  * Medium Gluten-Free" },
      { "text": "1" },
      { "text": "21.99" }
    ],
    [
      { "text": "  * Large" },
      { "text": "1" },
      { "text": "19.99" }
    ],
    [
      { "text": "  * BBQ Sauce" },
      { "text": "1" },
      { "text": "1.95" }
    ],
    [
      { "text": "  * Hellfire Sauce" },
      { "text": "1" },
      { "text": "1.95" }
    ]
  ]
};

async function runTest() {
  const printer = new PureImagePrinter(576, undefined, {fontFamily: 'NotoSansSCVF'});
  
  await printer.advancedTableCustom(tableData, true);
  
  const outPath = path.resolve(__dirname, 'test-advanced-table-output.png');
  await printer.printToFile(outPath);
  console.log(`Test completed. Image saved to ${outPath}`);
}

runTest().catch(console.error);

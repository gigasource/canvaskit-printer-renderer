const assert = require('assert');
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
      { "text": "1. Margherita Pizza", "bold": true },
      { "text": "1" },
      { "text": "42.00" }
    ],
    [
      { "text": "1x Medium Gluten-Free with extra spicy sauce and roasted garlic and mushrooms", "paddingLeft": 7 },
      { "text": "1" },
      { "text": "21.99" }
    ],
    [
      { "text": "1x Large", "paddingLeft": 7 },
      { "text": "1" },
      { "text": "19.99" }
    ],
    [
      { "text": "1x BBQ Sauce", "paddingLeft": 7 },
      { "text": "1" },
      { "text": "1.95" }
    ],
    [
      { "text": "1x Hellfire Sauce", "paddingLeft": 7 },
      { "text": "1" },
      { "text": "1.95" }
    ]
  ]
};

async function runTest() {
  const printer = new PureImagePrinter(576, undefined, { fontFamily: 'Roboto_Condensed' });

  // 1. Unit test logic: test data output directly without needing image verification
  const { colMetaData, rows } = printer.prepareAdvancedTable(tableData, true);

  assert.strictEqual(rows[0].borderBottom, true, 'Row 0 should have borderBottom');
  assert.strictEqual(rows[1].borderBottom, false, 'Row 1 should not have borderBottom');

  // Verify input tableData.data was not mutated
  assert.strictEqual(
    tableData.data[2][0].text.startsWith(' '),
    false,
    'Input tableData.data should not be mutated with leading spaces'
  );

  // Verify long modifier text wrapped into multiple lines and every line starts with paddingLeft spaces
  const expectedPadding = tableData.data[2][0].paddingLeft || 0;
  const expectedPrefix = ' '.repeat(expectedPadding);
  const modifierLines = rows[2].columns[0].text.split('\n');
  assert.ok(modifierLines.length > 1, 'Long modifier should wrap into multiple lines');
  for (let idx = 0; idx < modifierLines.length; idx++) {
    assert.ok(
      modifierLines[idx].startsWith(expectedPrefix),
      `Line ${idx} should start with ${expectedPadding} spaces: "${modifierLines[idx]}"`
    );
  }
  console.log('Unit test assertions passed!');
  console.log(`Processed modifier lines (paddingLeft: ${expectedPadding}):\n` + rows[2].columns[0].text);

  // 2. Visual render verification
  await printer.advancedTableCustom(tableData, true);

  const outPath = path.resolve(__dirname, 'test-advanced-table-output.png');
  await printer.printToFile(outPath);
  console.log(`Test completed. Image saved to ${outPath}`);
}

runTest().catch(console.error);

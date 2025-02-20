const path = require('path');
const BASE_FONT_FAMILY = 'Verdana';

const pwd = __dirname

console.log('pwd', pwd)

const fontFamilies = {
  'Verdana': path.resolve(__dirname + `/../assets/fonts/${BASE_FONT_FAMILY}.ttf`),
  'Verdana_Bold': path.resolve(__dirname + `/../assets/fonts/${BASE_FONT_FAMILY}_Bold.ttf`),
  'Verdana_Italic': path.resolve(__dirname + `/../assets/fonts/${BASE_FONT_FAMILY}_Italic.ttf`),
  'Verdana_Bold_Italic': path.resolve(__dirname + `/../assets/fonts/${BASE_FONT_FAMILY}_Bold_Italic.ttf`),
  'NotoSansSCVF': path.resolve(__dirname + `/../assets/fonts/NotoSansSC-Regular.ttf`),
  'NotoSansSCVF_Bold': path.resolve(__dirname + `/../assets/fonts/NotoSansSC-Regular.ttf`),
  'NotoSansSCVF_Italic': path.resolve(__dirname + `/../assets/fonts/NotoSansSC-Regular.ttf`),
  'NotoSansSCVF_Bold_Italic': path.resolve(__dirname + `/../assets/fonts/NotoSansSC-Regular.ttf`),
}

module.exports = fontFamilies

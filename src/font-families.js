const path = require('path');
const BASE_FONT_FAMILY = 'Verdana';

const fontFamilies = {
  'Verdana': path.resolve(__dirname + `/../assets/fonts/${BASE_FONT_FAMILY}.ttf`),
  'Verdana_Bold': path.resolve(__dirname + `/../assets/fonts/${BASE_FONT_FAMILY}_Bold.ttf`),
  'Verdana_Italic': path.resolve(__dirname + `/../assets/fonts/${BASE_FONT_FAMILY}_Italic.ttf`),
  'Verdana_Bold_Italic': path.resolve(__dirname + `/../assets/fonts/${BASE_FONT_FAMILY}_Bold_Italic.ttf`),
  'HanSerif': path.resolve(__dirname + `/../assets/fonts/SourceHanSerifSC-VF.ttf`),
  'HanSerif_Bold': path.resolve(__dirname + `/../assets/fonts/SourceHanSerifSC-VF.ttf`),
  'HanSerif_Italic': path.resolve(__dirname + `/../assets/fonts/SourceHanSerifSC-VF.ttf`),
  'HanSerif_Bold_Italic': path.resolve(__dirname + `/../assets/fonts/SourceHanSerifSC-VF.ttf`),
}

module.exports = fontFamilies

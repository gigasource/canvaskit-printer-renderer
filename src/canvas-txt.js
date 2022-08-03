// Hair space character for precise justification
const SPACE = '\u200a'

const canvasTxt = {
  debug: false,
  align: 'center',
  vAlign: 'middle',
  fontSize: 14,
  fontWeight: '',
  fontStyle: '',
  fontVariant: '',
  font: 'Arial',
  lineHeight: null,
  justify: false,
  /**
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} mytext
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @param {boolean} invert
   */

  measureText: function(ctx, text) {
    const { fontStyle, fontVariant, fontWeight, fontSize, font } = this
    const style = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${font}`
    ctx.font = style.trim();
    return ctx.measureText(text)
  },
  estimateLines: function(ctx, mytext, width) {
    // Parse all to integers
    const { fontStyle, fontVariant, fontWeight, fontSize, font } = this
    const style = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${font}`
    ctx.font = style.trim();
    const firstCharacterWidth = ctx.measureText('M').width;
    if (firstCharacterWidth >= width) {
      return 10000
    }
    //added one-line only auto linebreak feature
    let textarray = []
    let temptextarray = mytext.split('\n')
    const spaceWidth = this.justify ? ctx.measureText(SPACE).width : 0
    temptextarray.forEach(txtt => {
      let textwidth = ctx.measureText(txtt).width
      if (textwidth <= width) {
        textarray.push(txtt)
      } else {
        let temptext = txtt
        let linelen = width
        let textlen
        let textpixlen
        let texttoprint
        textwidth = ctx.measureText(temptext).width
        while (textwidth > linelen) {
          textlen = 0
          textpixlen = 0
          texttoprint = ''
          while (textpixlen < linelen) {
            textlen++
            texttoprint = temptext.substr(0, textlen)
            textpixlen = ctx.measureText(temptext.substr(0, textlen)).width
          }
          // Remove last character that was out of the box
          textlen--
          texttoprint = texttoprint.substr(0, textlen)
          //if statement ensures a new line only happens at a space, and not amidst a word
          const backup = textlen
          if (temptext.substr(textlen, 1) != ' ') {
            while (temptext.substr(textlen, 1) != ' ' && textlen != 0) {
              textlen--
            }
            if (textlen == 0) {
              textlen = backup
            }
            texttoprint = temptext.substr(0, textlen)
          }

          texttoprint = this.justify
            ? this.justifyLine(ctx, texttoprint, spaceWidth, SPACE, width)
            : texttoprint

          temptext = temptext.substr(textlen)
          textwidth = ctx.measureText(temptext).width
          textarray.push(texttoprint)
        }
        if (textwidth > 0) {
          textarray.push(temptext)
        }
      }
    })
    return textarray.length
  },
  drawText: function(ctx, mytext, x, y, width, height, invert) {
    // Parse all to integers
    ;[x, y, width, height] = [x, y, width, height].map(el => parseInt(el))

    if (width <= 0 || height <= 0 || this.fontSize <= 0) {
      //width or height or font size cannot be 0
      return {width, height}
    }

    // End points
    let xEnd = x + width
    const yEnd = y + height

    if (this.textSize) {
      console.error(
        '%cCanvas-Txt:',
        'font-weight: bold;',
        'textSize is depricated and has been renamed to fontSize'
      )
    }

    const { fontStyle, fontVariant, fontWeight, fontSize, font } = this
    const style = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${font}`
    ctx.font = style.trim();

    let txtY = y + height / 2 + parseInt(this.fontSize) / 2

    let textanchor

    if (this.align === 'right') {
      textanchor = xEnd
      ctx.textAlign = 'right'
    } else if (this.align === 'left') {
      textanchor = x
      ctx.textAlign = 'left'
    } else {
      textanchor = x + width / 2
      ctx.textAlign = 'center'
    }

    const firstCharacterWidth = ctx.measureText(mytext.substr(0, 1)).width;
    if (firstCharacterWidth >= width) {
      width = Math.floor(firstCharacterWidth) + 1;
      xEnd = x + width;

      if (this.align === 'right') textanchor = xEnd;
      else if (this.align !== 'right' && this.align !== 'left') textanchor = Math.floor(x + width / 2);
    }

    //added one-line only auto linebreak feature
    let textarray = []
    let temptextarray = mytext.split('\n')

    const spaceWidth = this.justify ? ctx.measureText(SPACE).width : 0

    temptextarray.forEach(txtt => {
      let textwidth = ctx.measureText(txtt).width
      if (textwidth <= width) {
        textarray.push(txtt)
      } else {
        let temptext = txtt
        let linelen = width
        let textlen
        let textpixlen
        let texttoprint
        textwidth = ctx.measureText(temptext).width
        while (textwidth > linelen) {
          textlen = 0
          textpixlen = 0
          texttoprint = ''
          while (textpixlen < linelen) {
            textlen++
            texttoprint = temptext.substr(0, textlen)
            textpixlen = ctx.measureText(temptext.substr(0, textlen)).width
          }
          // Remove last character that was out of the box
          textlen--
          texttoprint = texttoprint.substr(0, textlen)
          //if statement ensures a new line only happens at a space, and not amidst a word
          const backup = textlen
          if (temptext.substr(textlen, 1) != ' ') {
            while (temptext.substr(textlen, 1) != ' ' && textlen != 0) {
              textlen--
            }
            if (textlen == 0) {
              textlen = backup
            }
            texttoprint = temptext.substr(0, textlen)
          }

          texttoprint = this.justify
            ? this.justifyLine(ctx, texttoprint, spaceWidth, SPACE, width)
            : texttoprint

          temptext = temptext.substr(textlen)
          textwidth = ctx.measureText(temptext).width
          textarray.push(texttoprint)
        }
        if (textwidth > 0) {
          textarray.push(temptext)
        }
      }
      // end foreach temptextarray
    })
    console.log(this.lineHeight)
    const charHeight = this.lineHeight
      ? this.lineHeight
      : this.getTextHeight(ctx, mytext, style) //close approximation of height with width
    const vheight = charHeight * (textarray.length - 1)
    const negoffset = vheight / 2

    let debugY = y
    // Vertical Align
    if (this.vAlign === 'top') {
      txtY = y + this.fontSize
    } else if (this.vAlign === 'bottom') {
      txtY = yEnd - vheight
      debugY = yEnd
    } else {
      //defaults to center
      debugY = y + height / 2
      txtY -= negoffset
    }
    //print all lines of text

    const backgroundColor = invert ? "black" : "white"
    const textColor = invert ? "white" : "black"
    textarray.forEach(txtline => {
      txtline = txtline.trim()
      const h = this.getTextHeight(ctx, txtline, style)
      console.log( h, txtline, style)
      if (txtline && backgroundColor === 'black') {
        const estimateWidth = ctx.measureText(txtline).width
        ctx.fillStyle = backgroundColor
        let xStart
        if (this.align === 'center') xStart = x + width / 2 - estimateWidth / 2
        if (this.align === 'left') xStart = x
        if (this.align === 'right') xStart = x + width - estimateWidth
        const paddingLeft = Math.min(xStart, fontSize / 4)
        ctx.fillRect(xStart -paddingLeft, txtY - charHeight, paddingLeft + estimateWidth + fontSize / 4, charHeight + fontSize / 3)
      }

      ctx.fillStyle = textColor
      ctx.fillText(txtline, textanchor, txtY)
      txtY += charHeight
    })

    if (this.debug) {
      // Text box
      ctx.lineWidth = 3
      ctx.strokeStyle = '#00909e'
      ctx.strokeRect(x, y, width, height)

      ctx.lineWidth = 2
      // Horizontal Center
      ctx.strokeStyle = '#f6d743'
      ctx.beginPath()
      ctx.moveTo(textanchor, y)
      ctx.lineTo(textanchor, yEnd)
      ctx.stroke()
      // Vertical Center
      ctx.strokeStyle = '#ff6363'
      ctx.beginPath()
      ctx.moveTo(x, debugY)
      ctx.lineTo(xEnd, debugY)
      ctx.stroke()
    }

    const TEXT_HEIGHT = vheight + charHeight

    return { height: TEXT_HEIGHT, width }
  },
  // Calculate Height of the font
  getTextHeight: function(ctx, text, style) {
    const previousTextBaseline = ctx.textBaseline
    const previousFont = ctx._font

    ctx.textBaseline = 'bottom'
    ctx.font = style.trim();
    const metrics = ctx.measureText(text)

    const height = metrics.emHeightAscent - metrics.emHeightDescent;
    // Reset baseline
    ctx.textBaseline = previousTextBaseline
    ctx.font = `${previousFont.size}px ${previousFont.family}`

    return height
  },
  /**
   * This function will insert spaces between words in a line in order
   * to raise the line width to the box width.
   * The spaces are evenly spread in the line, and extra spaces (if any) are inserted
   * between the first words.
   *
   * It returns the justified text.
   *
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} line
   * @param {number} spaceWidth
   * @param {string} spaceChar
   * @param {number} width
   */
  justifyLine: function(ctx, line, spaceWidth, spaceChar, width) {
    const text = line.trim()

    const lineWidth = ctx.measureText(text).width

    const nbSpaces = text.split(/\s+/).length - 1
    const nbSpacesToInsert = Math.floor((width - lineWidth) / spaceWidth)

    if (nbSpaces <= 0 || nbSpacesToInsert <= 0) return text

    // We insert at least nbSpacesMinimum and we add extraSpaces to the first words
    const nbSpacesMinimum = Math.floor(nbSpacesToInsert / nbSpaces)
    let extraSpaces = nbSpacesToInsert - nbSpaces * nbSpacesMinimum

    let spaces = []
    for (let i = 0; i < nbSpacesMinimum; i++) {
      spaces.push(spaceChar)
    }
    spaces = spaces.join('')

    const justifiedText = text.replace(/\s+/g, match => {
      const allSpaces = extraSpaces > 0 ? spaces + spaceChar : spaces
      extraSpaces--
      return match + allSpaces
    })

    return justifiedText
  }
}

module.exports = canvasTxt

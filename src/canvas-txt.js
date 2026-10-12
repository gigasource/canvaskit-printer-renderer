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
   * @param {string} text
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

  splitWordByWidth: function(ctx, word, width) {
    const parts = []
    let current = word
    while (ctx.measureText(current).width > width) {
      let splitIdx = current.length - 1
      while (splitIdx > 1 && ctx.measureText(current.substring(0, splitIdx)).width > width) {
        splitIdx--
      }
      parts.push(current.substring(0, splitIdx))
      current = current.substring(splitIdx)
    }
    parts.push(current)
    return parts
  },

  splitTextIntoLines: function(ctx, text, width) {
    const lines = []
    const spaceWidth = this.justify ? ctx.measureText(SPACE).width : 0

    const pushLine = (line) => {
      lines.push(this.justify ? this.justifyLine(ctx, line, spaceWidth, SPACE, width) : line)
    }

    const paragraphs = text.split('\n')
    for (let p = 0; p < paragraphs.length; p++) {
      const paragraph = paragraphs[p]
      if (ctx.measureText(paragraph).width <= width) {
        lines.push(paragraph)
        continue
      }

      let currentLine = ''
      let isFirstWord = true

      const words = paragraph.split(' ')
      for (let w = 0; w < words.length; w++) {
        const word = words[w]
        const testLine = isFirstWord ? word : `${currentLine} ${word}`

        if (ctx.measureText(testLine).width <= width) {
          currentLine = testLine
          isFirstWord = false
        } else {
          if (!isFirstWord) {
            pushLine(currentLine)
            currentLine = word
          }

          const parts = this.splitWordByWidth(ctx, currentLine, width)
          for (let i = 0; i < parts.length - 1; i++) {
            pushLine(parts[i])
          }
          currentLine = parts[parts.length - 1]
          isFirstWord = false
        }
      }

      if (!isFirstWord) pushLine(currentLine)
    }

    return lines
  },

  estimateLines: function(ctx, text, width) {
    // Parse all to integers
    const { fontStyle, fontVariant, fontWeight, fontSize, font } = this
    const style = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize}px ${font}`
    ctx.font = style.trim();
    // Rely on splitTextIntoLines to handle extremely narrow widths natively
    
    return this.splitTextIntoLines(ctx, text, width).length
  },
  
  drawText: function(ctx, text, x, y, width, height, invert) {
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

    const firstCharacterWidth = ctx.measureText(text.substr(0, 1)).width;
    if (firstCharacterWidth >= width) {
      width = Math.floor(firstCharacterWidth) + 1;
      xEnd = x + width;

      if (this.align === 'right') textanchor = xEnd;
      else if (this.align !== 'right' && this.align !== 'left') textanchor = Math.floor(x + width / 2);
    }

    let lines = this.splitTextIntoLines(ctx, text, width)

    const charHeight = this.lineHeight
      ? this.lineHeight
      : this.getTextHeight(ctx, text, style) //close approximation of height with width
    const vheight = charHeight * (lines.length - 1)
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
    lines.forEach(line => {
      line = line.trimEnd()
      const h = this.getTextHeight(ctx, line, style)
      if (line && backgroundColor === 'black') {
        const estimateWidth = ctx.measureText(line).width
        ctx.fillStyle = backgroundColor
        let xStart
        if (this.align === 'center') xStart = x + width / 2 - estimateWidth / 2
        if (this.align === 'left') xStart = x
        if (this.align === 'right') xStart = x + width - estimateWidth
        const paddingLeft = Math.min(xStart, fontSize / 4)
        ctx.fillRect(xStart -paddingLeft, txtY - charHeight, paddingLeft + estimateWidth + fontSize / 4, charHeight + fontSize / 3)
      }

      ctx.fillStyle = textColor
      ctx.fillText(line, textanchor, txtY)
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

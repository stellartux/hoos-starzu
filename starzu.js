function getName() {
  return 'Hoos Starzu'
}

function Starzu(text, options) {
  this.text = text
  this.options = options
  this.selected = 0
}

Starzu.prototype.drawMenu = function () {
  for (let i = 0; i < this.options.length; i++) {
    drawText(
      (i + 1) + ' ' + this.options[i][0],
      this.selected === i ? 14 : 10,
      12,
      19 + i - this.options.length
    )
  }
}

Starzu.prototype.onConnect = function () {
  clearScreen()
  drawBox(4, 8, 2, 40, 20)
  drawBox(8, -1, -1, 58, 4)
  drawText('Hoos Starzu', 10, 1, 1)
  this.drawMenu()
  drawTextWrapped(this.text, 10, 10, 3, 36)
}

Starzu.prototype.onInput = function (key) {
  if (key === 10) { // enter
    return switchToScene(scenes[this.options[this.selected][1]])
  } else if (key === 17) { // up arrow
    this.selected--
    this.selected %= this.options.length
  } else if (key === 18) { // down arrow
    this.selected++
    this.selected %= this.options.length
  } else if (key >= 49 && key <= 57) {
    if (key - 49 < this.options.length) {
      return switchToScene(scenes[this.options[key - 49][1]])
    }
  } else if (key === 59) { // semicolon
    this.onConnect()
  }
  this.drawMenu()
}

Starzu.prototype.onUpdate = noop

function noop() { }

/** 
 * @param {string} name
 * @param {function[]} pages 
 * @param {string} parent
 **/
function Pager(name, pages, parent) {
  this.name = name
  this.pages = pages
  this.pageNo = 0
  this.parent = parent || null
}

Pager.prototype.onConnect = function () {
  this.pageNo = 0
  this.showPage()
}

Pager.prototype.onInput = function (key) {
  switch (key) {
    case 110: // n
      if (this.pageNo !== this.pages.length - 1) this.pageNo++
      break
    case 112: // p
      if (this.pageNo !== 0) this.pageNo--
      break
    case 113: // q
      return switchToScene(scenes[this.parent])
    default:
      break
  }
  this.showPage()
}

Pager.prototype.onUpdate = noop

Pager.prototype.showPage = function () {
  clearScreen()
  drawText(this.name, 14, 28 - (this.name.length / 2 | 0), 0)
  drawText('Q', 12, 25, 19)
  drawText('uit', 8, 26, 19)
  if (this.pageNo > 0) {
    drawText('P', 12, 0, 19)
    drawText('revious', 8, 1, 19)
  }
  if (this.pageNo < this.pages.length - 1) {
    drawText('N', 12, 52, 19)
    drawText('ext', 8, 53, 19)
  }
  this.pages[this.pageNo]()
}

/** @type {Record<string,{ onConnect: () => void, onUpdate: () => void, onInput: (key: number) => void, state?: Record<string,any> }>} */
const scenes = {
  index: new Starzu(
    'I am Starzu, master hacker pirate extraordinaire. You have entered Hoos Starzu, a secret repository of software all but lost to the mists of obscurity and bitrot. What treasures will you find within?',
    [
      ['DinkySoft SIMPL', 'simplIndex'],
      ["Starzu's Language", 'libs']
    ]
  ),
  simplIndex: new Starzu(
    'I miss the old days of computers. You switch on your machine and a happy little interpreter pops up to see you. Now there are so many layers of complexity between you and the machine. I\'ve been longing for simpler times. I managed to write an emulator for DinkySoft SIMPL from my old Z2 in NETroScript. It\'s amazing what these modern machines can do if you program them to.',
    [
      ['Run DinkySoft SIMPL', 'simpl'],
      ['Read the manual', 'simplManual'],
      ['Back', 'index']
    ]
  ),
  simplManual: new Pager(
    'A Beginner\'s Guide To SIMPL',
    [
      function () {
        drawTextWrapped('SIMPL is a programming language which allows novice users an easy way to interact with their machine. Although not as efficient as programming directly in Z2 assembly, SIMPL\'s high level constructs and use of "structured programming" provide a comfortable and approachable introduction to the world of computing. Let\'s explore some of SIMPL\'s features together.', 14, 1, 2, 54)
        drawTextWrapped('Comments in SIMPL are preceded by a #.', 14, 1, 10, 54)
        drawText('# This is a comment', 10, 3, 12)
        drawTextWrapped('Perform arithmetic with +, -, *, / and %.', 14, 1, 14, 54)
        drawText('2 + 3 * 4', 12, 3, 16)
        drawText('#═ 14', 10, 3, 17)
      },
      function () {
        drawTextWrapped('Strings in SIMPL are surrounded by double quotes. Strings can be concatenated with the + operator. Two double quotes in a row prints a literal double quote.', 14, 1, 2, 54)
        drawText('"Hello," + " world!"', 12, 3, 6)
        drawText('#═ Hello, world!', 10, 3, 7)
        drawText('"Hello, ""world""!"', 12, 3, 8)
        drawText('#═ Hello, "world"!', 10, 3, 9)
        drawTextWrapped('Variables can be written to and read from like so.', 14, 1, 11, 54)
        drawText('x ═ 3', 12, 3, 13)
        drawText('#═ 3', 10, 3, 14)
        drawText('x + 2', 12, 3, 15)
        drawText('#═ 5', 10, 3, 16)
      },
      function () {
        drawTextWrapped('Functions are called with arguments in parentheses. Create your own functions by writing to a call. Write longer functions with a do block. Functions return their value of their final statement.', 14, 1, 2, 54)
        drawText('half(x) ═ x / 2', 12, 3, 7)
        drawText('#═ half(x)', 10, 3, 8)
        drawText('half(6)', 12, 3, 9)
        drawText('#═ 3', 10, 3, 10)
        drawText('triplePlusOne(x) ═ do', 12, 3, 11)
        drawText('x *═ 3', 12, 5, 12)
        drawText('x + 1', 12, 5, 13)
        drawText('end', 12, 3, 14)
        drawText('#═ triplePlusOne(x)', 10, 3, 15)
        drawText('triplePlusOne(3)', 12, 3, 16)
        drawText('#═ 10', 10, 3, 17)
      }
    ], 'simplIndex')
}

let currentScene
function switchToScene(scene) {
  if (!scene) throw new Error('scene does not exist')
  scene.onConnect()
  currentScene = scene
}
function onConnect() {
  switchToScene(scenes.index)
}
function onInput(key) {
  currentScene.onInput(key)
}
function onUpdate() {
  currentScene.onUpdate()
}

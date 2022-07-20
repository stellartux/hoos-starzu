function getName() {
  return 'Hoos Starzu'
}

/**
 * @param {string} text 
 * @param {string[][]} options 
 */
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

Starzu.prototype.onInput = function (/** @type {number} */ key) {
  if (key === 10) { // enter
    return switchToScene(this.options[this.selected][1])
  } else if (key === 17) { // up arrow
    this.selected--
    this.selected %= this.options.length
  } else if (key === 18) { // down arrow
    this.selected++
    this.selected %= this.options.length
  } else if (key >= 49 && key <= 57) {
    if (key - 49 < this.options.length) {
      return switchToScene(this.options[key - 49][1])
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

Pager.prototype.onInput = function (/** @type {number} */ key) {
  switch (key) {
    case 110: // n
      if (this.pageNo !== this.pages.length - 1) this.pageNo++
      break
    case 112: // p
      if (this.pageNo !== 0) this.pageNo--
      break
    case 113: // q
      return switchToScene(this.parent)
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


/**
 * @param {string[]} lines
 * @param {{ interpret: (code: string) => any }} [interpreter]
 */
function Terminal(lines, interpreter) {
  this.lines = lines || []
  this.history = []
  this.historyFocus = 0
  this.line = []
  this.tick = 0
  /** @type {(code: string) => any} */
  this.interpret = interpreter.interpret.bind(interpreter)
}

Terminal.prototype.concat = function (/** @type {ConcatArray<string>} */ lines) {
  if (lines) {
    this.lines.concat(lines)
    this.draw()
  }
}

Terminal.prototype.clearLine = function (/** @type {number} */ lineNumber) {
  if (lineNumber === undefined) lineNumber = this.lines.length - 1
  drawText(' '.repeat(56), 0, 0, lineNumber)
}

Terminal.prototype.draw = function () {
  clearScreen()
  this.drawLines()
  this.drawLine()
  this.drawCursor()
}

Terminal.prototype.drawCursor = function () {
  if ((this.tick & 0xf) == 0xf) {
    drawText(this.tick & 0x10 ? '▄' : ' ', 8, this.line.length, Math.min(
      this.lines.length, this.height - 1
    ))
  }
}

Terminal.prototype.drawLine = function () {
  const row = Math.min(this.lines.length, this.height - 1)
  this.clearLine(row)
  drawText(this.lineString() + ' ', 13, 0, row)
}

Terminal.prototype.drawLines = function () {
  clearScreen()
  for (let n = 0, i = Math.max(0, this.lines.length - this.height + 1); i < this.lines.length; i++) {
    drawText(this.lines[i], 13, 0, n++)
  }
}

Terminal.prototype.height = 20
Terminal.prototype.width = 56

/** @returns {string} */
Terminal.prototype.lineString = function (/** @type {number[]?} */ line) {
  return String.fromCharCode.apply(String, line || this.line).replace(/=/g, '═')
}

Terminal.prototype.onConnect = function () {
  this.drawLines()
}

Terminal.prototype.onInput = function (/** @type {number} */ key) {
  if (key === 8) { // backspace
    this.line.pop()
  } else if (key === 9) { // tab
    do this.line.push(32)
    while (this.line.length < 55 && this.line.length & 3)
  } else if (key === 10) { // enter
    const line = this.lineString()
    const result = this.interpret(line)
    this.pushLine(line)
    this.history.push(line)
    this.historyFocus = this.history.length
    if (result !== null) {
      this.pushLine('#═ ' + result)
    }
    this.line.length = 0
  } else if (key === 17) { // up arrow
    this.clearLine(this.lines.length)
    this.line = (this.history[this.historyFocus] || '')
      .split('')
      .map(function (/** @type {string} */ c) { return c.charCodeAt(0) })
    this.historyFocus = Math.max(0, this.historyFocus - 1)
  } else if (key === 19) { // left arrow
    while (this.line.length > 0 && this.line.pop() !== 32);
  } else if (key === 27) { // escape
    this.draw()
  } else if (key === 59) { // semicolon
    this.draw()
  } else if (key >= 32 && key <= 126) { // visible characters
    if (this.line.length < 55) {
      this.line.push(key)
      this.drawLine()
    }
  } else { // hmmm
    drawText(key.toString().padStart(3), 13, 50, 0)
  }
  this.drawLine()
  this.drawCursor()
}

Terminal.prototype.onUpdate = function () {
  this.tick = (this.tick + 1) & 0xffffffff
  this.drawCursor()
}

Terminal.prototype.pushLine = function (/** @type {string|number[]} */ line) {
  this.clearLine(this.lines.length)
  this.lines.push(typeof line === 'string' ? line : this.lineString(line))
  if (this.lines.length >= 256) this.lines.shift()
  this.drawLines()
  this.historyFocus = this.history.length
}

/** The Simpl interpreter evaluates Simpl code line by line. */
function Simpl() {
  this.builtIns = {
    abs: Math.abs,
    cls: function () {
      clearScreen()
      this.lines.length = 0
    }
  }
  this.bindings = Object.create(this.builtIns)
}

Simpl.prototype.assert = function (/** @type {any} */ value, /** @type {string} */ msg) {
  if (!value) throw new Error(msg)
}

Simpl.prototype.interpret = function (/** @type {string} */ code) {
  return this.evaluate(this.parse(code || ''))
}

Simpl.prototype.parse = function (/** @type {string} */ code) {
  if (!code) return null
  const tokens = (
    code.match(/#.*|[-+*/%=!]=?|\.\.?|[(),.]|"([^"]+|"")*"|\d+|\w+/g) || []
  ).filter(function (t) { return t[0] !== '#' })
  if (tokens.length === 0) return null
  return this.statement(tokens)
}

Simpl.prototype.statement = function (/** @type {string[]} */ tokens) {
  if (tokens[0] === 'do') {
    tokens.shift()
    return this.blockStatement(tokens)
  } else {
    return this.expressionStatement(tokens)
  }
}

Simpl.prototype.expressionStatement = function (/** @type {string[]} */ tokens) {
  return {
    type: 'ExpressionStatement',
    expression: this.expression(tokens)
  }
}

Simpl.prototype.blockStatement = function (/** @type {string[]} */ tokens) {
  const result = {
    type: 'BlockStatement',
    body: []
  }
  while (tokens.length > 0 && tokens[0] !== 'end') {
    result.body.push(this.statement(tokens))
  }
}

Simpl.prototype.expression = function (/** @type {string[]} */ tokens) {
  if (tokens[0] === '[') {
    return this.arrayExpression(tokens)
  } else if (tokens[0] === 'function') {
    return this.functionExpression(tokens)
  } else {
    return this.assignmentExpression(tokens)
  }
}

Simpl.prototype.arrayExpression = function (/** @type {string[]} */ tokens) {
  this.assert(tokens.shift() === '[', 'Expected "["')
  const result = {
    type: 'ArrayExpression',
    elements: []
  }
  while (tokens.length > 0 && tokens[0] !== ']') {
    result.elements.push(tokens[0] === ',' ? null : this.expression(tokens))
    if (tokens[0] === ',') {
      tokens.shift()
    } else {
      this.assert(tokens[0] === ']', 'Expected "," or "]" in array expression.')
    }
  }
  return result
}

Simpl.prototype.functionExpression = function (/** @type {string[]} */ tokens) {
  this.assert(tokens.shift() === 'function', 'Expected "function" keyword')
  const result = {
    type: 'FunctionExpression',
    id: null,
    params: [],
    body: null
  }
  if (tokens[0] !== '(') {
    result.id = this.identifier(tokens)
  }
  this.assert(tokens.shift() === '(', 'Expected "("')
  while (tokens.length > 0 && tokens[0] !== ')') {
    result.params.push(this.expression(tokens))
  }
  result.body = this.blockStatement(tokens)
  return result
}

Simpl.prototype.assignmentExpression = function (/** @type {string[]} */ tokens) {
  const left = this.binaryExpression(tokens)
  if (/[-+*/]?=/.test(tokens[0])) {
    return {
      type: 'AssignmentExpression',
      left: left,
      operator: tokens.shift(),
      right: this.expression(tokens)
    }
  } else {
    return left
  }
}

Simpl.prototype.precedences = [
  // ['=='],
  // ['||', 'or'],
  // ['&&', 'and'],
  ['*', '/', '%'],
  ['+', '-']
]

Simpl.prototype.binaryExpression = function (/** @type {string[]} */ tokens, /** @type {number} */ precedence, /** @type {boolean} */ rightAssociative) {
  precedence = precedence || 0
  if (precedence < this.precedences.length) {
    let left = this.binaryExpression(tokens, precedence + 1)
    if (this.precedences[precedence].indexOf(tokens[0]) !== -1) {
      return {
        type: 'BinaryExpression',
        left: left,
        operator: tokens.shift(),
        right: this.binaryExpression(tokens, precedence + 1 - +rightAssociative, rightAssociative)
      }
    } else {
      return left
    }
  } else {
    return this.unaryExpression(tokens)
  }
}

Simpl.prototype.unaryExpression = function (/** @type {any[]} */ tokens) {
  if (tokens[0] === '+' || tokens[0] === '-') {
    return {
      type: 'UnaryExpression',
      operator: tokens.shift(),
      prefix: true,
      argument: this.unaryExpression(tokens)
    }
  } else {
    return this.literal(tokens)
  }
}

Simpl.prototype.identifier = function (/** @type {string[]} */ tokens) {
  this.assert(/^[a-zA-Z_]\w*$/.test(tokens[0]), '"' + tokens[0] + '" is not a valid identifier')
  return {
    type: 'Identifier',
    name: tokens.shift()
  }
}

Simpl.prototype.literal = function (/** @type {string[]} */ tokens) {
  if (tokens[0].match(/^\d/)) {
    return {
      type: 'Literal',
      value: parseInt(tokens.shift())
    }
  } else if (tokens[0][0] === '"') {
    return {
      type: 'Literal',
      value: tokens.shift().slice(1, -1).replace(/""/g, '"'),
    }
  } else if (tokens[0].match(/^(true|false)$/)) {
    return {
      type: 'Literal',
      value: tokens.shift() === 'true'
    }
  } else if (tokens[0] === '(') {
    tokens.shift()
    const expr = this.expression(tokens)
    this.assert(tokens.shift() === ')')
    expr.parenthesised = true
    return expr
  } else {
    return this.identifier(tokens)
  }
}

/** @type {Record<string, (left: number, right: number) => number>} */
Simpl.prototype.operators = {
  '+': function (left, right) { return left + right },
  '-': function (left, right) { return left - right },
  '*': function (left, right) { return left * right },
  '/': function (left, right) { return left / right },
  '%': function (left, right) { return left % right },
}

Simpl.prototype.evaluators = {
  AssignmentExpression: function (/** @type {{ operator: string; left: { type: string; name: string; }; right: any; }} */ ast) {
    if (ast.operator === '=') {
      if (ast.left.type === 'Identifier') {
        const right = this.evaluate(ast.right)
        this.bindings[ast.left.name] = right
        return right
      } // TODO: CallExpression, MemberExpression
    }
    throw new Error('AssignmentExpression not implemented')
  },
  BinaryExpression: function (/** @type {{ operator: string | number; left: any; right: any; }} */ ast) {
    return this.operators[ast.operator](this.evaluate(ast.left), this.evaluate(ast.right))
  },
  ExpressionStatement: function (/** @type {{ expression: any; }} */ ast) {
    return this.evaluate(ast.expression)
  },
  Identifier: function (/** @type {{ name: string; }} */ ast) {
    if (ast.name in this.bindings) {
      return this.bindings[ast.name]
    } else {
      return null
    }
  },
  Literal: function (/** @type {{ value: any; }} */ ast) {
    return ast.value
  },
  UnaryExpression: function (/** @type {{ operator: string; argument: any; }} */ ast) {
    if (ast.operator === '+') {
      return this.evaluate(ast.argument)
    } else if (ast.operator === '-') {
      return -this.evaluate(ast.argument)
    } else if (ast.operator === '!') {
      return !this.evaluate(ast.argument)
    } else {
      throw new Error('Unimplemented operator: ' + ast.operator)
    }
  }
}

Simpl.prototype.evaluate = function (/** @type {any} */ ast) {
  if (!ast) {
    return null
  } else if (ast.type in this.evaluators) {
    return this.evaluators[ast.type].bind(this)(ast)
  } else {
    throw new Error('Unimplemented evaluator: ' + ast.type)
  }
}

/** @typedef {{ onConnect: () => void, onUpdate: () => void, onInput: (key: number) => void }} Scene */
/** @type {Record<string,Scene>} */
const scenes = {
  index: new Starzu(
    'I am Starzu, master hacker pirate extraordinaire. You have entered Hoos Starzu, a secret repository of software all but lost to the mists of obscurity and bitrot. What treasures will you find within?',
    [
      ['DinkySoft SIMPL', 'simplIndex'],
      ['Libs', 'libs'],
    ]
  ),
  libs: new Starzu(
    'Libs is a language written by yours truly. It doesn\'t have the professional facade of DinkySoft\'s work, but it has heart. It\s not quite ready to release, but watch this space.',
    [
      // ['Libs, the language invented by Starzu', ''],
      ['Back', 'index'],
    ]
  ),
  simpl: new Terminal(
    [
      '#',
      '#   DDD  I N  N K  K Y   Y',
      '#   D  D I NN N K K   Y Y',
      '#   D  D I N NN KK     Y',
      '#   D  D I N  N K K    Y',
      '#   DDD  I N  N K  K   Y',
      '#',
      '# DinkySoft™ SIMPL™ v0.1.0',
      '# Structured Imperative Microchip Programming Language',
      '# (c) DinkySoft Corporation 1976',
      '#',
    ],
    new Simpl()
  ),
  simplIndex: new Starzu(
    'I miss the old days of computers. You switch on your machine and a happy little interpreter pops up to see you. Now there are so many layers of complexity between you and the machine. I\'ve been longing for simpler times. I managed to write an emulator for DinkySoft SIMPL from my old Z2 in NETroScript. It\'s amazing what these modern machines can do if you program them to.',
    [
      ['Run DinkySoft SIMPL', 'simpl'],
      ['Read the manual', 'simplManual'],
      ['Back', 'index'],
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
        drawTextWrapped('Functions are called with arguments in parentheses. Create your own functions by writing to a call. Write longer functions with a do block. Functions return the value of the last statement executed.', 14, 1, 2, 54)
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
      // TODO if/elif/else, builtins, decide specifics of number syntax
    ], 'simplIndex'),
  starzu: new Starzu('So you want to know more about the notorious Starzu? ', [['Back', 'index']])
}

//////////////////////////////// Scene Manager

/** @type {Scene} */
let currentScene
/** @param {string} scene */
function switchToScene(scene) {
  if (!scene || !(scene in scenes)) throw new Error(scene + ' is not a scene')
  currentScene = scenes[scene]
  currentScene.onConnect()
}
function onConnect() {
  switchToScene('index')
}
/** @param {number} key */
function onInput(key) {
  currentScene.onInput(key)
}
function onUpdate() {
  currentScene.onUpdate()
}

//////////////////////////////// Polyfills

String.prototype.at = String.prototype.at || function (/** @type {number?} */ i) {
  return this[i >= 0 ? i : this.length - i]
}

String.prototype.padStart = String.prototype.padStart || function (/** @type {number} */ maxLength, /** @type {string} */ fillString) {
  return (fillString || ' ').repeat(Math.max(0, maxLength - this.length)) + this
}

String.prototype.repeat = String.prototype.repeat || function (/** @type {number} */ count) {
  const result = []
  while (result.length < count) {
    result.push(this)
  }
  return result.join('')
}

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
    case 98: case 112: // b, p
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
    drawText('B', 12, 0, 19)
    drawText('ack', 8, 1, 19)
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
  this.interpret = interpreter
    ? interpreter.interpret.bind(interpreter)
    : function () { return null }
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
  if (key === 8 || key == 19) { // backspace or left arrow
    this.line.pop()
  } else if (key === 9) { // tab
    do this.line.push(32)
    while (this.line.length < 55 && this.line.length & 3)
  } else if (key === 10) { // enter
    const result = this.interpret(String.fromCharCode.apply(String, this.line))
    this.pushLine(this.lineString())
    if (result && this.line.length > 0) this.history.push(this.line.slice())
    this.historyFocus = this.history.length
    if (result === undefined) {
      throw new Error('TODO multiline code input')
    } else if (typeof result === 'function') {
      this.pushLine('#═ ' + result.realName)
    } else if (result !== null) {
      this.pushLine('#═ ' + result)
    }
    this.line.length = 0
  } else if (key === 17) { // up arrow
    this.clearLine(this.lines.length)
    this.historyFocus = Math.max(0, this.historyFocus - 1)
    this.line = this.history[this.historyFocus] || []
  } else if (key === 18) { // down arrow
    this.clearLine(this.lines.length)
    this.historyFocus = Math.min(this.history.length, this.historyFocus + 1)
    this.line = this.history[this.historyFocus] || []
  } else if (key === 27) { // escape
    return switchToScene('simplIndex')
  } else if (key === 59) { // semicolon
    this.draw()
  } else if (key >= 32 && key <= 126) { // visible characters
    if (this.line.length < 55) {
      this.line.push(key)
      this.drawLine()
    }
  } else if (key === 127) { // delete
    while (this.line.length > 0 && this.line.pop() !== 32);
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
    },
  }
  this.bindings = Object.create(this.builtIns)
}

Simpl.prototype.assert = function (/** @type {any} */ value, /** @type {string} */ msg) {
  if (!value) throw new Error(msg)
}

Simpl.prototype.interpret = function (/** @type {string} */ code) {
  const ast = this.parse(code)
  return ast && this.evaluate(ast)
}

Simpl.prototype.tokenize = function (/** @type {string} */ code) {
  return (
    code.match(/#.*|[-+*/%=!]=?|\.\.?|[(),.]|"([^"]+|"")*"|\d+|\w+/g) || []
  ).filter(function (t) { return t[0] !== '#' })
}

Simpl.prototype.parse = function (/** @type {string} */ code) {
  if (!code) return null
  const tokens = this.tokenize(code)
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

Simpl.prototype.unaryExpression = function (/** @type {string[]} */ tokens) {
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

/**
 * @param {string[]} tokens
 * @param {Identifier} [id]
 */
Simpl.prototype.callExpression = function (tokens, id) {
  const result = {
    type: 'CallExpression',
    callee: id || this.identifier(tokens),
    arguments: []
  }
  this.assert(tokens.shift() === '(', 'Expected "("')
  while (tokens[0] !== ')') {
    this.assert(tokens.length > 0, 'Unexpected end of input')
    result.arguments.push(this.expression(tokens))
    if (tokens[0] !== ')') {
      this.assert(tokens.shift() === ',', 'Expected ","')
    }
  }
  this.assert(tokens.shift() === ')', 'Unexpected end of input')
  return result
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
      value: Number(tokens.shift())
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
  } else if (tokens[1] === '(') {
    return this.callExpression(tokens)
  } else {
    return this.identifier(tokens)
  }
}

/** @type {Record<BinaryOperator, (left: number, right: number) => number>} */
Simpl.prototype.operators = {
  '+': function (left, right) { return left + right },
  '-': function (left, right) { return left - right },
  '*': function (left, right) { return left * right },
  '/': function (left, right) { return left / right | 0 },
  '%': function (left, right) { return left % right },
}

Simpl.prototype.evaluators = {
  AssignmentExpression: function (/** @type {AssignmentExpression} */ ast, /** @type {object} */ scope) {
    if (ast.left.type === 'Identifier') {
      const right = this.evaluate(ast.right, scope)
      scope[ast.left.name] = right
      return right
    } else if (ast.left.type === 'CallExpression') {
      const name = ast.left.callee.name
      scope[name] = function () {
        const functionScope = Object.create(scope)
        // @ts-ignore
        for (let i = 0; i < ast.left.arguments.length; i++) {
          // @ts-ignore
          functionScope[ast.left.arguments[i].name] = arguments[i]
        }
        return this.evaluate(ast.right, functionScope)
      }.bind(this)
      scope[name].realName = name + '(' +
        ast.left.arguments.map(function (arg) {
          // @ts-ignore
          return arg.name
        }).join(', ') + ')'
      return scope[name]
    } else {
      // @ts-ignore
      throw new Error("Can't assign to a " + ast.left.type)
    }
  },
  BinaryExpression: function (/** @type {BinaryExpression} */ ast, scope) {
    return this.operators[ast.operator](this.evaluate(ast.left, scope), this.evaluate(ast.right, scope))
  },
  CallExpression: function (/** @type {CallExpression} */ ast, scope) {
    this.assert(typeof scope[ast.callee.name] === 'function', ast.callee.name + ' is not a function.')
    const f = scope[ast.callee.name]
    return f.apply(f, ast.arguments.map(function (arg) {
      return this.evaluate(arg, scope)
    }.bind(this)))
  },
  ExpressionStatement: function (/** @type {ExpressionStatement} */ ast, scope) {
    return this.evaluate(ast.expression, scope)
  },
  Identifier: function (/** @type {Identifier}} */ ast, scope) {
    if (ast.name in scope) {
      return scope[ast.name]
    } else {
      return null
    }
  },
  Literal: function (/** @type {Literal} */ ast) {
    return ast.value
  },
  UnaryExpression: function (/** @type {UnaryExpression} */ ast, scope) {
    if (ast.operator === '+') {
      return this.evaluate(ast.argument, scope)
    } else if (ast.operator === '-') {
      return -this.evaluate(ast.argument, scope)
    } else if (ast.operator === '!') {
      return !this.evaluate(ast.argument, scope)
    } else {
      throw new Error('Unimplemented operator: ' + ast.operator)
    }
  }
}

Simpl.prototype.evaluate = function (/** @type {Node} */ ast, scope) {
  scope = scope || this.bindings
  if (!ast) {
    return null
  } else if (ast.type in this.evaluators) {
    return this.evaluators[ast.type].bind(this)(ast, scope)
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
      // ['Libs', 'libsIndex'],
      ['About Me', 'starzu']
    ]
  ),
  libsIndex: new Starzu(
    'Libs is a language written by yours truly. It doesn\'t have the professional facade of DinkySoft\'s work, but it has heart. It\s not quite ready to release, but watch this space.',
    [
      // ['Run the Libs REPL', 'libs'],
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
      '# Press Esc to exit',
      '#'
    ],
    new Simpl()
  ),
  simplIndex: new Starzu(
    'I miss the old days of computers. You switch on your machine and a happy little interpreter pops up to see you. Now there are so many layers of complexity between you and the machine. I\'ve been longing for simpler times. I wrote an emulator for my old Z2 in NETroScript that can manage to run DinkySoft SIMPL. It\'s amazing what these modern machines can do if you program them to.',
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
        drawTextWrapped('Perform integer arithmetic with +, -, *, / and %.', 14, 1, 14, 54)
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
        drawTextWrapped('Functions are called with arguments in parentheses. Create your own functions by writing to a call.', 14, 1, 2, 54)
        drawText('half(x) ═ x / 2', 12, 3, 5)
        drawText('#═ half(x)', 10, 3, 6)
        drawText('half(6)', 12, 3, 7)
        drawText('#═ 3', 10, 3, 8)
        // drawTextWrapped('Functions are called with arguments in parentheses. Create your own functions by writing to a call. Write longer functions with a do block. Functions return the value of the last statement executed.', 14, 1, 2, 54)
        // drawText('half(x) ═ x / 2', 12, 3, 7)
        // drawText('#═ half(x)', 10, 3, 8)
        // drawText('half(6)', 12, 3, 9)
        // drawText('#═ 3', 10, 3, 10)
        // drawText('triplePlusOne(x) ═ do', 12, 3, 11)
        // drawText('x *═ 3', 12, 5, 12)
        // drawText('x + 1', 12, 5, 13)
        // drawText('end', 12, 3, 14)
        // drawText('#═ triplePlusOne(x)', 10, 3, 15)
        // drawText('triplePlusOne(3)', 12, 3, 16)
        // drawText('#═ 10', 10, 3, 17)
      }
      // TODO if/elif/else
    ], 'simplIndex'),
  starzu: new Starzu('So you want to know more about the notorious Starzu? What else can I say except all the legends you\'ve heard about me are true.', [['Back', 'index']])
}

//////////////////////////////// Scene Manager

/** @type {Scene} */
let currentScene
/** @param {string} scene */
function switchToScene(scene) {
  if (!scene || !(scene in scenes)) throw new Error(scene + ' is not a scene name')
  currentScene = scenes[scene]
  clearScreen()
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

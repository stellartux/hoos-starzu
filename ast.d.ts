interface Node {
  type: string
}

interface Identifier {
  type: 'Identifier'
  name: string
}

interface Literal {
  type: 'Literal'
  value: string | boolean | null | number
}

interface Program {
  type: 'Program'
  body: [Statement]
}

interface Function extends Node {
  id: Identifier | null
  params: [Identifier]
  body: FunctionBody
}

interface FunctionBody extends BlockStatement {}

interface FunctionDeclaration extends Function {
  type: 'FunctionDeclaration'
  id: Identifier
}

interface Statement extends Node {}

interface ExpressionStatement extends Statement {
  type: 'ExpressionStatement'
  expression: Expression
}

interface BlockStatement extends Statement {
  type: 'BlockStatement'
  body: [Statement]
}

interface FunctionBody {
  body: [Statement]
}

interface EmptyStatement extends Statement {
  type: 'EmptyStatement'
}

interface ReturnStatement extends Statement {
  type: 'ReturnStatement'
  argument: Expression | null
}

interface IfStatement extends Statement {
  type: 'IfStatement'
  test: Expression
  consequent: Statement
  alternate: Statement | null
}

interface WhileStatement extends Statement {
  type: 'WhileStatement'
  test: Expression
  body: Statement
}

interface DoWhileStatement extends Statement {
  type: 'DoWhileStatement'
  body: Statement
  test: Expression
}

interface Expression extends Node {}

interface ArrayExpression extends Expression {
  type: 'ArrayExpression'
  elements: [Expression | null]
}

interface FunctionExpression extends Function, Expression {
  type: 'FunctionExpression'
}

interface UnaryExpression extends Expression {
  type: 'UnaryExpression'
  operator: UnaryOperator
  prefix: boolean
  argument: Expression
}

declare enum UnaryOperator {
  '-' = '-',
  '+' = '+',
  '!' = '!',
  '~' = '~',
  'typeof' = 'typeof',
  'void' = 'void',
  'delete' = 'delete',
}

interface BinaryExpression extends Expression {
  type: 'BinaryExpression'
  operator: BinaryOperator
  left: Expression
  right: Expression
}

declare enum BinaryOperator {
  '==' = '==',
  '!=' = '!=',
  '<' = '<',
  '<=' = '<=',
  '>' = '>',
  '>=' = '>=',
  '<<' = '<<',
  '>>' = '>>',
  '>>>' = '>>>',
  '+' = '+',
  '-' = '-',
  '*' = '*',
  '/' = '/',
  '%' = '%',
  '|' = '|',
  '^' = '^',
  '&' = '&',
  'in' = 'in',
  'instanceof' = 'instanceof',
}

interface AssignmentExpression extends Expression {
  type: 'AssignmentExpression'
  operator: AssignmentOperator
  left: CallExpression | Identifier
  right: Expression
}

declare enum AssignmentOperator {
  '=' = '=',
  '+=' = '+=',
  '-=' = '-=',
  '*=' = '*=',
  '/=' = '/=',
  '%=' = '%=',
  '<<=' = '<<=',
  '>>=' = '>>=',
  '>>>=' = '>>>=',
  '|=' = '|=',
  '^=' = '^=',
  '&=' = '&=',
}

interface LogicalExpression extends Expression {
  type: 'LogicalExpression'
  operator: LogicalOperator
  left: Expression
  right: Expression
}

declare enum LogicalOperator {
  '||' = '||',
  '&&' = '&&',
}

interface ConditionalExpression extends Expression {
  type: 'ConditionalExpression'
  test: Expression
  alternate: Expression
  consequent: Expression
}

interface CallExpression extends Expression {
  type: 'CallExpression'
  callee: Identifier
  arguments: [Expression]
}

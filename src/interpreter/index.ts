import {
  createToken,
  Lexer,
  CstParser,
  tokenMatcher,
  CstNode,
} from "chevrotain";

// actual Tokens that can appear in the text
const AdditionOperator = createToken({
  name: "AdditionOperator",
  pattern: Lexer.NA,
});
const Plus = createToken({
  name: "Plus",
  pattern: /\+/,
  categories: AdditionOperator,
});
const Minus = createToken({
  name: "Minus",
  pattern: /-/,
  categories: AdditionOperator,
});

const MultiplicationOperator = createToken({
  name: "MultiplicationOperator",
  pattern: Lexer.NA,
});

const Multi = createToken({
  name: "Multi",
  pattern: /\*/,
  categories: MultiplicationOperator,
});

const Div = createToken({
  name: "Div",
  pattern: /\//,
  categories: MultiplicationOperator,
});

const LParen = createToken({ name: "LParen", pattern: /\(/ });
const RParen = createToken({ name: "RParen", pattern: /\)/ });

const NumberLiteral = createToken({
  name: "NumberLiteral",
  pattern: /\d+/,
});

const FunctionName = createToken({
  name: "FunctionName",
  pattern: /[a-z_][a-zA-Z0-9_]*/,
});

const Comma = createToken({ name: "Comma", pattern: /,/ });

const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

const Let = createToken({
  name: "Let",
  pattern: /let/,
});
const Equal = createToken({
  name: "Equal",
  pattern: /=/,
});

const LCurly = createToken({ name: "LCurly", pattern: /{/ });
const RCurly = createToken({ name: "RCurly", pattern: /}/ });

const Semicolon = createToken({ name: "Semicolon", pattern: /;/ });

const allTokens = [
  WhiteSpace,
  Let,
  LCurly,
  RCurly,
  Plus,
  Minus,
  Multi,
  Div,
  Equal,
  LParen,
  RParen,
  NumberLiteral,
  AdditionOperator,
  MultiplicationOperator,
  FunctionName,
  Comma,
  Semicolon,
];
const CalculatorLexer = new Lexer(allTokens);

// ----------------- parser -----------------
// Note that this is a Pure grammar, it only describes the grammar
// Not any actions (semantics) to perform during parsing.
class CalculatorPure extends CstParser {
  constructor() {
    super(allTokens);

    const $ = this;

    $.RULE("expression", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.letStatement) },
        { ALT: () => $.SUBRULE($.blockStatement) }, // Handle block statements
        { ALT: () => $.SUBRULE($.additionExpression) },
      ]);
    });

    $.RULE("blockStatement", () => {
      $.CONSUME(LCurly);
      $.MANY(() => {
        $.SUBRULE($.expression); // Handle multiple expressions inside the block
        $.OPTION(() => $.CONSUME(Semicolon)); // Optional semicolon
      });
      $.CONSUME(RCurly);
    });

    $.RULE("letStatement", () => {
      $.CONSUME(Let);
      $.SUBRULE($.functionName, { LABEL: "lhs" });
      $.CONSUME(Equal); // 你需要定义一个 Equal Token (用于 "=")
      $.SUBRULE($.expression, { LABEL: "rhs" }); // 解析表达式并将其赋给变量
    });

    //  lowest precedence thus it is first in the rule chain
    // The precedence of binary expressions is determined by how far down the Parse Tree
    // The binary expression appears.
    $.RULE("additionExpression", () => {
      $.SUBRULE($.multiplicationExpression, { LABEL: "lhs" });
      $.MANY(() => {
        // consuming 'AdditionOperator' will consume either Plus or Minus as they are subclasses of AdditionOperator
        $.CONSUME(AdditionOperator);
        //  the index "2" in SUBRULE2 is needed to identify the unique position in the grammar during runtime
        $.SUBRULE2($.multiplicationExpression, { LABEL: "rhs" });
      });
    });

    $.RULE("multiplicationExpression", () => {
      $.SUBRULE($.atomicExpression, { LABEL: "lhs" });
      $.MANY(() => {
        $.CONSUME(MultiplicationOperator);
        //  the index "2" in SUBRULE2 is needed to identify the unique position in the grammar during runtime
        $.SUBRULE2($.atomicExpression, { LABEL: "rhs" });
      });
    });

    $.RULE("atomicExpression", () =>
      $.OR([
        { ALT: () => $.SUBRULE($.parenthesisExpression) },
        { ALT: () => $.CONSUME(NumberLiteral) },
        { ALT: () => $.SUBRULE($.functionCall) }, // Add function calls here
        { ALT: () => $.SUBRULE($.functionName) }, // 处理变量名
      ])
    );

    $.RULE("functionCall", () => {
      $.SUBRULE($.functionName);
      $.CONSUME(LParen);
      $.MANY(() => {
        $.SUBRULE($.expression);
        $.OPTION(() => $.CONSUME(Comma)); // Handle multiple arguments
      });
      $.CONSUME(RParen);
    });

    $.RULE("functionName", () => {
      $.CONSUME(FunctionName, { LABEL: "functionName" });
    });

    $.RULE("parenthesisExpression", () => {
      $.CONSUME(LParen);
      $.SUBRULE($.expression);
      $.CONSUME(RParen);
    });

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    this.performSelfAnalysis();
  }
  functionName(): CstNode {
    throw new Error("Method not implemented.");
  }
  functionCall(): CstNode {
    throw new Error("Method not implemented.");
  }
  blockStatement(): CstNode {
    throw new Error("Method not implemented.");
  }
  additionExpression(): CstNode {
    throw new Error("Method not implemented.");
  }
  multiplicationExpression(): CstNode {
    throw new Error("Method not implemented.");
  }
  atomicExpression(): CstNode {
    throw new Error("Method not implemented.");
  }
  parenthesisExpression(): CstNode {
    throw new Error("Method not implemented.");
  }
  powerFunction(): CstNode {
    throw new Error("Method not implemented.");
  }
  expression(): CstNode {
    throw new Error("Method not implemented.");
  }
  letStatement(): CstNode {
    throw new Error("Method not implemented.");
  }
}

// wrapping it all together
// reuse the same parser instance.
const parser = new CalculatorPure();

// ----------------- Interpreter -----------------
const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

class CalculatorInterpreter extends BaseCstVisitor {
  scopes: Record<string, any>[] = [{}]; // Initialize with a global scope

  constructor() {
    super();
    // This helper will detect any missing or redundant methods on this visitor
    this.validateVisitor();
  }

  // 处理 let 声明

  letStatement(ctx: any) {
    // console.log("letStatement", ctx);
    const varName = ctx.lhs[0].children.functionName[0].image; // Get variable name
    const value = this.visit(ctx.rhs); // Evaluate expression
    this.scopes[0][varName] = value; // Store variable in current scope
    return value;
  }

  blockStatement(ctx: any) {
    this.scopes.push({}); // Create a new scope
    this.visit(ctx.expression); // Visit all expressions in the block
    this.scopes.pop(); // Exit the scope
  }

  // Additional methods for handling variable lookups, etc.
  getVariable(name: string) {
    // console.log("getVariable", name, this.scopes);
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i][name] !== undefined) {
        return this.scopes[i][name];
      }
    }
    throw new Error(`Variable ${name} is not defined.`);
  }

  expression(ctx: any) {
    if (ctx.letStatement) {
      return this.visit(ctx.letStatement);
    } else if (ctx.blockStatement) {
      return this.visit(ctx.blockStatement);
    } else if (ctx.additionExpression) {
      return this.visit(ctx.additionExpression);
    }
  }

  additionExpression(ctx: any) {
    let result = this.visit(ctx.lhs);

    // "rhs" key may be undefined as the grammar defines it as optional (MANY === zero or more).
    if (ctx.rhs) {
      ctx.rhs.forEach(
        (rhsOperand: CstNode | CstNode[], idx: string | number) => {
          // there will be one operator for each rhs operand
          let rhsValue = this.visit(rhsOperand);
          let operator = ctx.AdditionOperator[idx];

          if (tokenMatcher(operator, Plus)) {
            result += rhsValue;
          } else {
            // Minus
            result -= rhsValue;
          }
        }
      );
    }

    return result;
  }

  multiplicationExpression(ctx: any) {
    let result = this.visit(ctx.lhs);

    // "rhs" key may be undefined as the grammar defines it as optional (MANY === zero or more).
    if (ctx.rhs) {
      ctx.rhs.forEach(
        (rhsOperand: CstNode | CstNode[], idx: string | number) => {
          // there will be one operator for each rhs operand
          let rhsValue = this.visit(rhsOperand);
          let operator = ctx.MultiplicationOperator[idx];

          if (tokenMatcher(operator, Multi)) {
            result *= rhsValue;
          } else {
            // Division
            result /= rhsValue;
          }
        }
      );
    }

    return result;
  }

  atomicExpression(ctx: any) {
    if (ctx.functionName) {
      const varName = ctx.functionName[0].children.functionName[0].image; // Get the variable name
      return this.getVariable(varName);
    } else if (ctx.parenthesisExpression) {
      // passing an array to "this.visit" is equivalent
      // to passing the array's first element
      return this.visit(ctx.parenthesisExpression);
    } else if (ctx.NumberLiteral) {
      // If a key exists on the ctx, at least one element is guaranteed
      return parseInt(ctx.NumberLiteral[0].image, 10);
    } else if (ctx.functionCall) {
      // If a key exists on the ctx, at least one element is guaranteed
      return this.visit(ctx.functionCall);
    } else {
      console.log(ctx);
    }
  }

  parenthesisExpression(ctx: any) {
    // The ctx will also contain the parenthesis tokens, but we don't care about those
    // in the context of calculating the result.
    return this.visit(ctx.expression);
  }

  // Enter a new scope
  enterScope() {
    this.scopes.unshift({}); // Add a new scope at the beginning
  }

  // Exit the current scope
  exitScope() {
    this.scopes.shift(); // Remove the current scope
  }

  // Visit a function call
  functionCall(ctx: any) {
    console.log(JSON.stringify(ctx, null, 2));
    const functionName = ctx.functionName[0].children.functionName[0].image; // Get the function name
    const args = ctx.expression.map((arg: any) => this.visit(arg)); // Evaluate the arguments

    // Check the function in the current scope
    let func = null;
    for (const scope of this.scopes) {
      if (functionName in scope) {
        func = scope[functionName];
        break;
      }
    }

    if (typeof func === "function") {
      return func(...args); // Call the function with evaluated arguments
    } else {
      throw new Error(`Function ${functionName} is not defined.`);
    }
  }

  // Example of adding a new function

  // Add a function to the current scope
  addFunction(name: string, func: (...args: any[]) => any) {
    this.scopes[0][name] = func; // Add to the global scope (first scope)
  }
  // Define the functionName method
  functionName(ctx: any) {
    console.log(ctx);
    return ctx[0].image; // Get the function name from the context
  }
}

export class MoonBitVM {
  private interpreter: CalculatorInterpreter;

  constructor() {
    this.interpreter = new CalculatorInterpreter();

    // 定义一些示例函数，例如 println
    this.interpreter.addFunction("println", (...args: any[]) => {
      console.log(...args);
      return args[0];
    });
  }

  // Evaluate an expression in the current scope
  eval(input: string) {
    const lexResult = CalculatorLexer.tokenize(input);
    parser.input = lexResult.tokens;
    const cst = parser.expression();
    return this.interpreter.visit(cst);
  }
}

// 使用示例

const vm = new MoonBitVM();
const result1 = vm.eval("let x = 5");
console.log(result1); // 输出 5
const result2 = vm.eval("x + 10"); // 应返回 15
console.log(result2); // 输出 15

// const vm = new MoonBitVM();
// const result1 = vm.eval("1+1");

// console.log(result1); // 输出 2

// const vm = new MoonBitVM();
// const result1 = vm.eval("println(5)");
// console.log(result1); // 输出 5

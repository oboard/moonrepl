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

const StringLiteral = createToken({
  name: "StringLiteral",
  // pattern: /"(?:[^\\"]|\\(?:[bfnrtv"\\/]|u[0-9a-fA-F]{4}))*"/,
  pattern: /"(?:[^"\\]|\\.)*"/, // 允许转义字符和普通字符
});

const NumberLiteral = createToken({
  name: "NumberLiteral",
  pattern: /\d+/,
});

// const EscapeSequence = createToken({
//   name: "EscapeSequence",
//   pattern: /\\[nt"\\]/, // 处理常见的转义字符：\n, \t, \", \\
// });

// const DoubleQuote = createToken({
//   name: "DoubleQuote",
//   pattern: /"/,
// });

const FunctionName = createToken({
  name: "FunctionName",
  pattern: /[a-z_][a-zA-Z0-9_]*/,
});
const If = createToken({
  name: "If",
  pattern: /if/,
});

const ComparisonOperator = createToken({
  name: "ComparisonOperator",
  pattern: Lexer.NA,
});

const Else = createToken({
  name: "Else",
  pattern: /else/,
});
const GreaterThan = createToken({
  name: "GreaterThan",
  pattern: />/,
  categories: ComparisonOperator,
});

const LessThan = createToken({
  name: "LessThan",
  pattern: /</,
  categories: ComparisonOperator,
});

const EqualEqual = createToken({
  name: "EqualEqual",
  pattern: /==/,
  categories: ComparisonOperator,
});

const GreaterThanOrEqual = createToken({
  name: "GreaterThanOrEqual",
  pattern: />=/,
  categories: ComparisonOperator,
});

const LessThanOrEqual = createToken({
  name: "LessThanOrEqual",
  pattern: /<=/,
  categories: ComparisonOperator,
});

const NotEqual = createToken({
  name: "NotEqual",
  pattern: /!=/,
  categories: ComparisonOperator,
});

// const And = createToken({
//   name: "And",
//   pattern: /&&/,
//   ca
// });

// const Or = createToken({
//   name: "Or",
//   pattern: /\|\|/,
// });

// const Not = createToken({
//   name: "Not",
//   pattern: /!/,
// });

// const True = createToken({
//   name: "True",
//   pattern: /true/,
// });

// const False = createToken({
//   name: "False",
//   pattern: /false/,
// });

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
const Mut = createToken({
  name: "Mut",
  pattern: /mut/,
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
  Semicolon,
  Let,
  Mut,
  If,
  Else,
  LCurly,
  RCurly,
  Plus,
  Minus,
  Multi,
  Div,
  GreaterThanOrEqual,
  LessThanOrEqual,
  EqualEqual,
  GreaterThan,
  LessThan,
  NotEqual,
  Equal,
  LParen,
  RParen,
  NumberLiteral,
  StringLiteral,
  ComparisonOperator,
  AdditionOperator,
  MultiplicationOperator,
  FunctionName,
  Comma,
];
const CalculatorLexer = new Lexer(allTokens);

// ----------------- parser -----------------
// Note that this is a Pure grammar, it only describes the grammar
// Not any actions (semantics) to perform during parsing.
class CalculatorPure extends CstParser {
  constructor() {
    super(allTokens);

    const $ = this;

    $.RULE("row", () => {
      $.MANY(() => {
        $.SUBRULE($.expression);
        $.OPTION(() => $.CONSUME(Semicolon));
      });
    });

    // 这里修改之后，expression函数中的判断也要同步修改
    $.RULE("expression", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.letStatement) },
        { ALT: () => $.SUBRULE($.ifStatement) }, // Handle if statements
        { ALT: () => $.SUBRULE($.assignmentStatement) }, // Handle assignment statements
        { ALT: () => $.SUBRULE($.comparisonExpression) }, // Handle comparison expressions
      ]);
    });

    $.RULE("comparisonExpression", () => {
      $.SUBRULE($.additionExpression, { LABEL: "lhs" });
      $.MANY(() => {
        // consuming 'AdditionOperator' will consume either Plus or Minus as they are subclasses of AdditionOperator
        $.CONSUME(ComparisonOperator);
        //  the index "2" in SUBRULE2 is needed to identify the unique position in the grammar during runtime
        $.SUBRULE2($.additionExpression, { LABEL: "rhs" });
      });
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
      $.CONSUME(Let); // 可选的 "mut" 关键字
      $.OPTION(() => $.CONSUME(Mut)); // 可选的 "mut" 关键字
      $.SUBRULE($.functionName, { LABEL: "lhs" });
      $.CONSUME(Equal); // 你需要定义一个 Equal Token (用于 "=")
      $.SUBRULE($.expression, { LABEL: "rhs" }); // 解析表达式并将其赋给变量
    });

    $.RULE("assignmentStatement", () => {
      $.SUBRULE($.functionName, { LABEL: "lhs" });
      $.CONSUME(Equal); // 解析 "="
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
        { ALT: () => $.CONSUME(StringLiteral) },
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

    $.RULE("ifStatement", () => {
      $.CONSUME(If); // Consume the 'if' token
      $.SUBRULE($.comparisonExpression); // Parse the condition
      $.SUBRULE($.blockStatement); // Parse the 'then' block
      // Handle else if and else

      $.MANY(() => {
        $.CONSUME(Else); // Consume the 'else' token
        $.OR([
          { ALT: () => $.SUBRULE($.ifStatement, { LABEL: "elseifStatement" }) },
          {
            ALT: () => $.SUBRULE2($.blockStatement, { LABEL: "elseStatement" }),
          }, // Parse the else block
        ]);
      });
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
  comparisonExpression(): CstNode {
    throw new Error("Method not implemented.");
  }
  atomicExpression(): CstNode {
    throw new Error("Method not implemented.");
  }
  parenthesisExpression(): CstNode {
    throw new Error("Method not implemented.");
  }
  row(): CstNode {
    throw new Error("Method not implemented.");
  }
  expression(): CstNode {
    throw new Error("Method not implemented.");
  }
  ifStatement(): CstNode {
    throw new Error("Method not implemented.");
  }
  letStatement(): CstNode {
    throw new Error("Method not implemented.");
  }
  assignmentStatement(): CstNode {
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

  ifStatement(ctx: any) {
    // console.log("ifStatement", ctx);
    const condition = this.visit(ctx.comparisonExpression); // Evaluate condition
    // console.log("condition", condition);
    // return condition;
    if (condition) {
      // If the condition is true, evaluate the 'then' block
      return this.visit(ctx.blockStatement[0]);
    } else {
      // Check for else if or else
      // ctx.ifStatement?.forEach((elseIfCtx: any) => {
      if (ctx.elseifStatement) {
        for (let i = 0; i < ctx.elseifStatement.length; i++) {
          const elseIfCtx = ctx.elseifStatement[i].children;
          console.log("elseIfCtx", elseIfCtx);
          const elseIfCondition = this.visit(elseIfCtx.comparisonExpression[0]); // Evaluate else if condition
          if (elseIfCondition) {
            // If else if condition is true, evaluate the 'else if' block
            return this.visit(elseIfCtx.blockStatement[0]);
          }
          if (elseIfCtx.elseStatement) {
            return this.visit(elseIfCtx.elseStatement[0]);
          }
        }
      }

      // Finally, check for else block if exists
      if (ctx.elseStatement) {
        // console.log("elseCtx", elseCtx);
        return this.visit(ctx.elseStatement[0]);
      }
    }
  }

  assignmentStatement(ctx: any) {
    // console.log("assignmentStatement", ctx);
    const varName = ctx.lhs[0].children.functionName[0].image; // Get variable name
    const value = this.visit(ctx.rhs); // Evaluate expression
    const scope = this.getVariableScope(varName) ?? this.scopes[0]; // Get the variable scope

    // 检查变量是否 writable
    if (Object.getOwnPropertyDescriptor(scope, varName)?.writable === false) {
      throw new Error(`Variable ${varName} is not mutable.`);
    }
    scope[varName] = value; // Store variable in current scope

    return value;
  }

  // 处理 let 声明

  letStatement(ctx: any) {
    // console.log("letStatement", ctx);
    const varName = ctx.lhs[0].children.functionName[0].image; // Get variable name
    const value = this.visit(ctx.rhs); // Evaluate expression
    // console.log("value", value);

    Object.defineProperty(this.scopes[0], varName, {
      value,
      writable: ctx.Mut !== undefined,
      enumerable: true,
      configurable: true,
    });
    // this.scopes[0][varName] = value; // Store variable in current scope
    return value;
  }

  blockStatement(ctx: any) {
    // console.log("blockStatement", ctx);
    this.scopes.push({}); // Create a new scope
    const result = this.visit(ctx.expression[0]); // Visit all expressions in the block
    this.scopes.pop(); // Exit the scope
    return result;
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

  getVariableScope(varName: string) {
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (varName in this.scopes[i]) {
        return this.scopes[i];
      }
    }
    if (strictMode) {
      throw new Error(`Variable ${varName} is not defined.`);
    }
  }

  row(ctx: any) {
    console.log("row", ctx);
    const length = ctx.expression.length;
    for (let i = 0; i < length - 1; i++) {
      this.visit(ctx.expression[i]);
    }
    console.log(length);
    return this.visit(ctx.expression[length - 1]);
  }

  expression(ctx: any) {
    if (ctx.letStatement) {
      return this.visit(ctx.letStatement);
    } else if (ctx.ifStatement) {
      return this.visit(ctx.ifStatement);
    } else if (ctx.assignmentStatement) {
      return this.visit(ctx.assignmentStatement);
    } else if (ctx.blockStatement) {
      return this.visit(ctx.blockStatement);
    } else if (ctx.comparisonExpression) {
      return this.visit(ctx.comparisonExpression);
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

  comparisonExpression(ctx: any) {
    let result = this.visit(ctx.lhs);
    // console.log("comparisonExpression", ctx, result);
    // "rhs" key may be undefined as the grammar defines it as optional (MANY === zero or more).
    if (ctx.rhs) {
      ctx.rhs.forEach(
        (rhsOperand: CstNode | CstNode[], idx: string | number) => {
          // there will be one operator for each rhs operand
          let rhsValue = this.visit(rhsOperand);
          let operator = ctx.ComparisonOperator[idx];

          if (tokenMatcher(operator, GreaterThan)) {
            result = result > rhsValue;
          } else if (tokenMatcher(operator, LessThan)) {
            result = result < rhsValue;
          } else if (tokenMatcher(operator, EqualEqual)) {
            result = result === rhsValue;
          } else if (tokenMatcher(operator, NotEqual)) {
            result = result !== rhsValue;
          } else if (tokenMatcher(operator, GreaterThanOrEqual)) {
            result = result >= rhsValue;
          } else if (tokenMatcher(operator, LessThanOrEqual)) {
            result = result <= rhsValue;
          }
        }
      );
    }
    // console.log("result", result);
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
    } else if (ctx.StringLiteral) {
      console.log(ctx.StringLiteral[0].image);
      // 获取字符串值，去掉引号
      let strValue: string = ctx.StringLiteral[0].image.slice(1, -1);

      // 处理转义字符
      strValue = strValue
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");

      // 处理模板字符串插值
      const templateRegex = /\\{([^{}]*)}/g;

      const parse = (input: string) => {
        const lexResult = CalculatorLexer.tokenize(input);
        parser.input = lexResult.tokens;
        const cst = parser.expression();
        return this.visit(cst);
      };

      strValue = strValue.replace(templateRegex, (_match, expression) => {
        console.log("expression", expression);
        const result = parse(expression);
        return String(result);
      });

      return strValue;
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
    // console.log(JSON.stringify(ctx, null, 2));
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
    // console.log(ctx);
    return ctx[0].image; // Get the function name from the context
  }
}

class MoonBitVM {
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
    const cst = parser.row();
    return this.interpreter.visit(cst);
  }
}

let strictMode = false;

// 使用示例

// const vm = new MoonBitVM();
// const result1 = vm.eval("let x = 5");
// console.log(result1); // 输出 5
// const result2 = vm.eval("x + 10"); // 应返回 15
// console.log(result2); // 输出 15

// const vm = new MoonBitVM();
// const result1 = vm.eval("1+1");

// console.log(result1); // 输出 2

// const vm = new MoonBitVM();
// const result1 = vm.eval("println(5)");
// console.log(result1); // 输出 5

// const vm = new MoonBitVM();
// console.log(vm.eval("let mut x = 5")); // 输出 5
// vm.eval("x = 10");
// const result2 = vm.eval("x + 10"); // 应返回 20
// console.log(result2); // 输出 20

// const vm = new MoonBitVM();
// console.log(vm.eval("let mut x = 5")); // 输出 5
// console.log(vm.eval("if x > 5 { 10 } else { 20 }")); // 输出 20

// const vm = new MoonBitVM();
// console.log(vm.eval("if 3 < 2 { 10 } else { 20 }")); // 输出 20

// const vm = new MoonBitVM();
// console.log(vm.eval("if 3 < 2 { 10 }")); // 输出 undefined

// const vm = new MoonBitVM();
// console.log(vm.eval("if 3 < 2 { 10 } else if 1 > 2 { 3 } else { 8 }")); // 输出 8

// const vm = new MoonBitVM();
// console.log(vm.eval('"haha"')); // 输出 haha
// console.log(vm.eval('"ha\\{1+1}ha"')); // 输出 ha2ha

export { MoonBitVM, strictMode };

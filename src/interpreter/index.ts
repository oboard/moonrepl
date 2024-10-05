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

const IntegerLiteral = createToken({
  name: "IntegerLiteral",
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

const Pipeline = createToken({
  name: "Pipeline",
  pattern: /\|>/,
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
  Pipeline,
  GreaterThanOrEqual,
  LessThanOrEqual,
  EqualEqual,
  GreaterThan,
  LessThan,
  NotEqual,
  Equal,
  LParen,
  RParen,
  IntegerLiteral,
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
        $.SUBRULE($.pipelineExpression);
        $.OPTION(() => $.CONSUME(Semicolon));
      });
    });

    $.RULE("pipelineExpression", () => {
      $.SUBRULE($.expression, { LABEL: "lhs" });

      $.MANY(() => {
        $.CONSUME(Pipeline);
        $.SUBRULE2($.expression, { LABEL: "rhs" });
      });
    });

    // 这里修改之后，expression函数中的判断也要同步修改
    $.RULE("expression", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.letStatement) },
        { ALT: () => $.SUBRULE($.ifStatement) },
        { ALT: () => $.SUBRULE($.assignmentStatement) },
        { ALT: () => $.SUBRULE($.comparisonExpression) },
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
        { ALT: () => $.CONSUME(IntegerLiteral) },
        { ALT: () => $.SUBRULE($.functionCall) },
        { ALT: () => $.SUBRULE($.functionName) },
      ])
    );

    $.RULE("functionCall", () => {
      $.SUBRULE($.functionName);
      $.SUBRULE($.tupleExpression);
      // $.CONSUME(LParen);
      // $.MANY(() => {
      //   $.SUBRULE($.expression);
      //   $.OPTION(() => $.CONSUME(Comma)); // Handle multiple arguments
      // });
      // $.CONSUME(RParen);
    });

    $.RULE("functionName", () => {
      $.CONSUME(FunctionName, { LABEL: "functionName" });
    });

    $.RULE("parenthesisExpression", () => {
      $.CONSUME(LParen);
      $.SUBRULE($.expression);
      $.CONSUME(RParen);
    });

    $.RULE("tupleExpression", () => {
      $.CONSUME(LParen);
      $.MANY(() => {
        $.SUBRULE($.expression);
        $.OPTION(() => $.CONSUME(Comma)); // Handle multiple arguments
      });
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
  tupleExpression(): CstNode {
    throw new Error("Method not implemented.");
  }
  functionCall(): CstNode {
    throw new Error("Method not implemented.");
  }
  pipelineExpression(): CstNode {
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
  scopes: Record<string, MoonBitValue>[] = [{}]; // Initialize with a global scope

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
          // console.log("elseIfCtx", elseIfCtx);
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
    // console.log("row", ctx);
    const length = ctx.pipelineExpression.length;
    for (let i = 0; i < length - 1; i++) {
      this.visit(ctx.pipelineExpression[i]);
    }
    // console.log(length);
    return this.visit(ctx.pipelineExpression[length - 1]);
  }

  expression(ctx: any) {
    // console.log("expression", ctx);
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

          let lhsValue = result.value;

          if (tokenMatcher(operator, GreaterThan)) {
            result = lhsValue > rhsValue;
          } else if (tokenMatcher(operator, LessThan)) {
            result = lhsValue < rhsValue;
          } else if (tokenMatcher(operator, EqualEqual)) {
            result = lhsValue === rhsValue;
          } else if (tokenMatcher(operator, NotEqual)) {
            result = lhsValue !== rhsValue;
          } else if (tokenMatcher(operator, GreaterThanOrEqual)) {
            result = lhsValue >= rhsValue;
          } else if (tokenMatcher(operator, LessThanOrEqual)) {
            result = lhsValue <= rhsValue;
          } else {
            return result;
          }

          result = new MoonBitValue(result, MoonBitType.Bool);
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
      // console.log(ctx.StringLiteral[0].image);
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
        // console.log("expression", expression);
        const result = parse(expression);
        return String(result);
      });

      return new MoonBitValue(strValue, MoonBitType.String);
    } else if (ctx.IntegerLiteral) {
      // If a key exists on the ctx, at least one element is guaranteed
      return new MoonBitValue(
        parseInt(ctx.IntegerLiteral[0].image, 10),
        MoonBitType.Int
      );
    } else if (ctx.functionCall) {
      // If a key exists on the ctx, at least one element is guaranteed
      return this.visit(ctx.functionCall);
    } else {
      console.log(ctx);
    }
  }

  pipelineExpression(ctx: any) {
    // console.log("pipelineExpression", JSON.stringify(ctx, null, 2));
    let result = this.visit(ctx.lhs); // Visit the first expression

    if (ctx.rhs) {
      for (let i = 0; i < ctx.rhs.length; i++) {
        const func = this.visit(ctx.rhs[i]);
        // console.log(
        //   "func",
        //   func.value({
        //     type: "Int",
        //     value: 20,
        //   })
        // );
        // console.log(result)

        if (func.type === MoonBitType.Function) {
          // this.callFunction(func, result);
          // console.log("func", func);
          result = func.value(result); // Call the function with the result
        } else {
          throw new Error(`Function ${func} is not defined.`);
        }
      }
    }
    return result;
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

  tupleExpression(ctx: any) {
    return ctx.expression?.map((expr: any) => this.visit(expr));
  }

  // Visit a function call
  functionCall(ctx: any) {
    // console.log(JSON.stringify(ctx, null, 2));
    const functionName = this.visit(ctx.functionName); // Get the function name
    const args = this.visit(ctx.tupleExpression); // Evaluate the arguments

    return this.callFunction(functionName, args);
  }

  callFunction(name: string, args: any[]) {
    // console.log("callFunction", name, args);
    // Check the function in the current scope
    let func = null;
    for (const scope of this.scopes) {
      if (name in scope) {
        func = scope[name];
        break;
      }
    }
    // console.log("func", func instanceof MoonBitFunction);
    if (func instanceof MoonBitFunction) {
      if (args === undefined) {
        return func;
      }
      // 检查类型
      func.args.forEach((arg: any, idx: number) => {
        if (arg.type !== args[idx].type) {
          throw new Error(`Argument ${idx} is not ${arg.type}`);
        }
      });
      return func.value(...args); // Call the function with evaluated arguments
    } else {
      throw new Error(`Function ${name} is not defined.`);
    }
  }

  // Example of adding a new function

  // Add a function to the current scope
  addFunction(name: string, func: MoonBitFunction) {
    this.scopes[0][name] = func; // Add to the global scope (first scope)
  }
  // Define the functionName method
  functionName(ctx: any) {
    // console.log("functionName", ctx);
    return ctx.functionName[0].image; // Get the function name from the context
  }
}

// enum MoonBitType {
//   Unit = "Unit",
//   Int = "Int",
//   Double = "Double",
//   String = "String",
//   Bool = "Bool",
//   Char = "Char",
//   Function = "Function",
// }

class MoonBitType {
  name: string = "Unit";

  static Unit = new MoonBitType("Unit");
  static Int = new MoonBitType("Int");
  static Double = new MoonBitType("Double");
  static String = new MoonBitType("String");
  static Bool = new MoonBitType("Bool");
  static Char = new MoonBitType("Char");
  static Function = new MoonBitType("Function");

  constructor(name: string) {
    this.name = name;
  }
}

class MoonBitValue {
  type: MoonBitType;
  value: any;

  static Unit = new MoonBitValue(undefined, MoonBitType.Unit);

  constructor(value: any, type?: MoonBitType) {
    if (type === undefined) {
      this.type = this.getType(value);
    } else {
      this.type = type;
    }
    this.value = value;
  }

  getType(value: any) {
    if (value === undefined) {
      return MoonBitType.Unit;
    } else if (typeof value === "number") {
      return MoonBitType.Int;
    } else if (typeof value === "string") {
      return MoonBitType.String;
    } else if (typeof value === "boolean") {
      return MoonBitType.Bool;
    } else if (typeof value === "function") {
      return MoonBitType.Function;
    } else {
      throw new Error(`Unknown type: ${typeof value}`);
    }
  }

  toString() {
    return this.value;
  }
}

class MoonBitArgument {
  name: string = "";
  type: MoonBitType = MoonBitType.String;

  constructor(name: string, type: MoonBitType) {
    this.name = name;
    this.type = type;
  }
}

class MoonBitFunction extends MoonBitValue {
  type: MoonBitType = MoonBitType.Function;
  args: MoonBitArgument[] = [];
  returnType: MoonBitType = MoonBitType.Unit;
  // value: (...args: MoonBitValue[]) => MoonBitValue = () => {};

  constructor(
    args: MoonBitArgument[],
    returnType: MoonBitType,
    value: (...args: MoonBitValue[]) => MoonBitValue
  ) {
    super(value, MoonBitType.Function);
    this.args = args;
    this.returnType = returnType;
  }
}

class MoonBitVM {
  private interpreter: CalculatorInterpreter;

  constructor() {
    this.interpreter = new CalculatorInterpreter();

    this.interpreter.addFunction(
      "println",
      new MoonBitFunction(
        [
          {
            type: MoonBitType.String,
            name: "arg",
          },
        ],
        MoonBitType.Unit,
        (arg: MoonBitValue) => {
          // console.log(arg.toString());
          return MoonBitValue.Unit;
        }
      )
    );

    this.interpreter.addFunction(
      "double",
      new MoonBitFunction(
        [new MoonBitArgument("arg", MoonBitType.Int)],
        MoonBitType.Double,
        (arg: MoonBitValue) => {
          return new MoonBitValue(arg.value * 2, MoonBitType.Double);
        }
      )
    );
  }

  // Evaluate an expression in the current scope
  eval(input: string) {
    const lexResult = CalculatorLexer.tokenize(input);
    parser.input = lexResult.tokens;
    const cst = parser.row();
    const value = this.interpreter.visit(cst);
    if (value.toString) {
      return value.toString();
    } else {
      return value;
    }
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

const vm = new MoonBitVM();
console.log(vm.eval('"haha" |> println')); // 输出 haha 返回 undefined
console.log(vm.eval("1 |> double()")); // 返回 2

export { MoonBitVM, strictMode };

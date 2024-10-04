import {
  createToken,
  Lexer,
  CstParser,
  tokenMatcher,
  ParserMethod,
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
  pattern: /[a-zA-Z_]\w*/,
});

const Comma = createToken({ name: "Comma", pattern: /,/ });

const WhiteSpace = createToken({
  name: "WhiteSpace",
  pattern: /\s+/,
  group: Lexer.SKIPPED,
});

const allTokens = [
  WhiteSpace, // whitespace is normally very common so it should be placed first to speed up the lexer's performance
  Plus,
  Minus,
  Multi,
  Div,
  LParen,
  RParen,
  NumberLiteral,
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

    $.RULE("expression", () => {
      $.SUBRULE($.additionExpression);
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
      $.CONSUME(FunctionName);
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
}

// wrapping it all together
// reuse the same parser instance.
const parser = new CalculatorPure();

// ----------------- Interpreter -----------------
const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

class CalculatorInterpreter extends BaseCstVisitor {
  constructor(
    private functions: Record<string, (...args: number[]) => number> = {}
  ) {
    super();
    // This helper will detect any missing or redundant methods on this visitor
    this.validateVisitor();
  }

  expression(ctx: any) {
    return this.visit(ctx.additionExpression);
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
    if (ctx.parenthesisExpression) {
      // passing an array to "this.visit" is equivalent
      // to passing the array's first element
      return this.visit(ctx.parenthesisExpression);
    } else if (ctx.NumberLiteral) {
      // If a key exists on the ctx, at least one element is guaranteed
      return parseInt(ctx.NumberLiteral[0].image, 10);
    }
  }

  parenthesisExpression(ctx: any) {
    // The ctx will also contain the parenthesis tokens, but we don't care about those
    // in the context of calculating the result.
    return this.visit(ctx.expression);
  }

  functionCall(ctx: any) {
    const functionName = ctx.functionName[0].image; // Get the function name
    const args = ctx.expression.map((arg: any) => this.visit(arg)); // Evaluate the arguments
    const func = this.functions[functionName];

    if (typeof func === "function") {
      return func(...args); // Call the function with evaluated arguments
    } else {
      throw new Error(`Function ${functionName} is not defined.`);
    }
  }

  // Define the functionName method
  functionName(ctx: any) {
    return ctx[0].image; // Get the function name from the context
  }

  // Example of adding a new function
  addFunction(name: string, func: (...args: number[]) => number) {
    this.functions[name] = func;
  }
}

export function evaluateExpression(input: string) {
  const lexResult = CalculatorLexer.tokenize(input);
  parser.input = lexResult.tokens;

  const cst = parser.expression();
  const visitor = new CalculatorInterpreter();

  return visitor.visit(cst);
}

// // 使用示例
// const result = evaluateExpression("1 + 1");
// console.log(result); // 输出 2

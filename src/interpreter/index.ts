import { createToken, Lexer, CstParser, tokenMatcher, ParserMethod, CstNode } from "chevrotain";

// using the NA pattern marks this Token class as 'irrelevant' for the Lexer.
// AdditionOperator defines a Tokens hierarchy but only the leafs in this hierarchy define
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
  pattern: /[1-9]\d*/,
});

const PowerFunc = createToken({ name: "PowerFunc", pattern: /power/ });
const Comma = createToken({ name: "Comma", pattern: /,/ });

// marking WhiteSpace as 'SKIPPED' makes the lexer skip it.
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
  PowerFunc,
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
        // parenthesisExpression has the highest precedence and thus it appears
        // in the "lowest" leaf in the expression ParseTree.
        { ALT: () => $.SUBRULE($.parenthesisExpression) },
        { ALT: () => $.CONSUME(NumberLiteral) },
        { ALT: () => $.SUBRULE($.powerFunction) },
      ])
    );

    $.RULE("parenthesisExpression", () => {
      $.CONSUME(LParen);
      $.SUBRULE($.expression);
      $.CONSUME(RParen);
    });

    $.RULE("powerFunction", () => {
      $.CONSUME(PowerFunc);
      $.CONSUME(LParen);
      $.SUBRULE($.expression, { LABEL: "base" });
      $.CONSUME(Comma);
      $.SUBRULE2($.expression, { LABEL: "exponent" });
      $.CONSUME(RParen);
    });

    // very important to call this after all the rules have been defined.
    // otherwise the parser may not work correctly as it will lack information
    // derived during the self analysis phase.
    this.performSelfAnalysis();
  }
  additionExpression(additionExpression: ParserMethod<[additionExpression: ParserMethod<[atomicExpression: any, arg1: { LABEL: string; }], CstNode>], CstNode>): CstNode {
    throw new Error("Method not implemented.");
  }
  multiplicationExpression(multiplicationExpression: ParserMethod<[multiplicationExpression: ParserMethod<[atomicExpression: any, arg1: { LABEL: string; }], CstNode>], CstNode>): CstNode {
    throw new Error("Method not implemented.");
  }
  atomicExpression(atomicExpression: ParserMethod<[atomicExpression: ParserMethod<[atomicExpression: any, arg1: { LABEL: string; }], CstNode>], CstNode>): CstNode {
    throw new Error("Method not implemented.");
  }
  parenthesisExpression(parenthesisExpression: ParserMethod<[parenthesisExpression: ParserMethod<[atomicExpression: any, arg1: { LABEL: string; }], CstNode>], CstNode>): CstNode {
    throw new Error("Method not implemented.");
  }
  powerFunction(powerFunction: ParserMethod<[powerFunction: ParserMethod<[atomicExpression: any, arg1: { LABEL: string; }], CstNode>], CstNode>): CstNode {
    throw new Error("Method not implemented.");
  }
  expression(expression?: ParserMethod<[expression: ParserMethod<[atomicExpression: any, arg1: { LABEL: string; }], CstNode>], CstNode>): CstNode {
    throw new Error("Method not implemented.");
  }
}

// wrapping it all together
// reuse the same parser instance.
const parser = new CalculatorPure();

// ----------------- Interpreter -----------------
const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

class CalculatorInterpreter extends BaseCstVisitor {
  constructor() {
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
      ctx.rhs.forEach((rhsOperand: CstNode | CstNode[], idx: string | number) => {
        // there will be one operator for each rhs operand
        let rhsValue = this.visit(rhsOperand);
        let operator = ctx.AdditionOperator[idx];

        if (tokenMatcher(operator, Plus)) {
          result += rhsValue;
        } else {
          // Minus
          result -= rhsValue;
        }
      });
    }

    return result;
  }

  multiplicationExpression(ctx: any) {
    let result = this.visit(ctx.lhs);

    // "rhs" key may be undefined as the grammar defines it as optional (MANY === zero or more).
    if (ctx.rhs) {
      ctx.rhs.forEach((rhsOperand: CstNode | CstNode[], idx: string | number) => {
        // there will be one operator for each rhs operand
        let rhsValue = this.visit(rhsOperand);
        let operator = ctx.MultiplicationOperator[idx];

        if (tokenMatcher(operator, Multi)) {
          result *= rhsValue;
        } else {
          // Division
          result /= rhsValue;
        }
      });
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
    } else if (ctx.powerFunction) {
      return this.visit(ctx.powerFunction);
    }
  }

  parenthesisExpression(ctx: any) {
    // The ctx will also contain the parenthesis tokens, but we don't care about those
    // in the context of calculating the result.
    return this.visit(ctx.expression);
  }

  powerFunction(ctx: any) {
    const base = this.visit(ctx.base);
    const exponent = this.visit(ctx.exponent);
    return Math.pow(base, exponent);
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

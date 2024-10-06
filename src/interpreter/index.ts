import {
  createToken,
  Lexer,
  CstParser,
  tokenMatcher,
  CstNode,
} from "chevrotain";
import { MoonBitEnum, MoonBitEnumMemberType, MoonBitFunctionType, MoonBitMap, MoonBitMapEntry, MoonBitStruct, MoonBitStructMemberType, MoonBitTrait, MoonBitType, MoonBitValue } from "./types";
import { MoonBitArgument, MoonBitFunction } from "./function";
import { MoonBitError, MoonBitErrorType } from "./error";

// actual Tokens that can appear in the text
const AdditionOperator = createToken({
  name: "AdditionOperator",
  pattern: Lexer.NA,
});
const Comment = createToken({
  name: "Comment",
  pattern: /\s*\/\/.*/
})
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

const NamedArgument = createToken({
  name: "NamedArgument",
  pattern: /~/,
});

const LBracket = createToken({
  name: "LBracket",
  pattern: /\[/,
})

const RBracket = createToken({
  name: "RBracket",
  pattern: /\]/,
});

const OptionalArgument = createToken({
  name: "OptionalArgument",
  pattern: /\?/,
});

const Arrow = createToken({
  name: "Arrow",
  pattern: /->/,
});

const MultiplicationOperator = createToken({
  name: "MultiplicationOperator",
  pattern: Lexer.NA,
});

const Pub = createToken({
  name: "Pub",
  pattern: /pub/,
});

const Fn = createToken({
  name: "Function",
  pattern: /fn/,
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

const Colon = createToken({ name: "Colon", pattern: /:/ });

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

const DoubleLiteral = createToken({
  name: "DoubleLiteral",
  pattern: /\d+\.\d+/,
});

const TypeName = createToken({
  name: "TypeName",
  pattern: /[A-Z][a-zA-Z0-9_]*/,
});

const FunctionName = createToken({
  name: "FunctionName",
  pattern: /[a-z_][a-zA-Z0-9_]*/,
});
const If = createToken({
  name: "If",
  pattern: /if/,
});
const While = createToken({
  name: "While",
  pattern: /while/,
});
const For = createToken({
  name: "For",
  pattern: /for/,
});
const Enum = createToken({
  name: "Enum",
  pattern: /enum/,
});
const Struct = createToken({
  name: "Struct",
  pattern: /struct/,
});
const Trait = createToken({
  name: "Trait",
  pattern: /trait/,
});
const Type = createToken({
  name: "Type",
  pattern: /type/,
});
const With = createToken({
  name: "With",
  pattern: /with/,
});
const Test = createToken({
  name: "Test",
  pattern: /test/,
});
const Dot = createToken({
  name: "Dot",
  pattern: /\./,
});
const Path = createToken({
  name: "Path",
  pattern: /::/,
});
const Derive = createToken({
  name: "Derive",
  pattern: /derive/,
});
const Impl = createToken({
  name: "Impl",
  pattern: /impl/,
});
const Match = createToken({
  name: "Match",
  pattern: /match/,
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

const Enter = createToken({
  name: "Enter",
  pattern: /\n/
})
const Semicolon = createToken({ name: "Semicolon", pattern: /;/ });

const allTokens = [
  WhiteSpace,
  Enter,
  Comment,
  Semicolon,
  Let,
  Mut,
  Pub,
  Fn,
  Enum,
  Struct,
  Derive,
  Impl,
  NamedArgument,
  OptionalArgument,
  Arrow,
  If,
  Else,
  While,
  For,
  Match,
  LCurly,
  RCurly,
  LBracket,
  RBracket,
  Plus,
  Minus,
  Multi,
  Div,
  Pipeline,
  Test,
  Type,
  With,
  Trait,
  Dot,
  Colon,
  GreaterThanOrEqual,
  LessThanOrEqual,
  EqualEqual,
  GreaterThan,
  LessThan,
  NotEqual,
  Equal,
  LParen,
  RParen,
  Path,
  DoubleLiteral,
  IntegerLiteral,
  StringLiteral,
  ComparisonOperator,
  AdditionOperator,
  MultiplicationOperator,
  FunctionName,
  TypeName,
  Comma,
];
const CalculatorLexer = new Lexer(allTokens);

// ----------------- parser -----------------
// Note that this is a Pure grammar, it only describes the grammar
// Not any actions (semantics) to perform during parsing.
class MoonBitPure extends CstParser {
  constructor() {
    super(allTokens);

    const $ = this;

    $.RULE("row", () => {
      $.MANY(() => {
        $.OR([
          { ALT: () => $.CONSUME(Comment) },
          { ALT: () => $.SUBRULE($.pipelineExpression) }
        ]);
        $.OPTION(() => $.CONSUME(Enter));
        $.OPTION2(() => $.CONSUME(Semicolon));
      });
    });

    $.RULE("pipelineExpression", () => {
      $.SUBRULE($.expression, { LABEL: "lhs" });

      $.MANY(() => {
        $.CONSUME(Pipeline);
        $.SUBRULE2($.expression, { LABEL: "rhs" });
      });
    });

    $.RULE("argumentStatement", () => {
      $.OPTION(() => $.CONSUME(NamedArgument));
      $.SUBRULE($.functionName, { LABEL: "name" });
      $.OPTION2(() => $.CONSUME(OptionalArgument));
      $.CONSUME(Colon);
      $.SUBRULE2($.typeStatement, { LABEL: "type" });
    });

    $.RULE("visitStatement", () => {
      $.SUBRULE($.functionName, { LABEL: "lhs" });
      $.SUBRULE2($.functionName, { LABEL: "rhs" });
    });

    $.RULE("enumMember", () => {
      $.CONSUME(TypeName, { LABEL: "name" });
      $.MANY(() => {
        $.CONSUME(LParen);
        $.MANY2(() => {
          $.SUBRULE($.typeStatement, { LABEL: "associatedType" });
          $.OPTION2(() => $.CONSUME2(Comma));
        });
        $.CONSUME(RParen);
      });
    });

    $.RULE("deriveStatement", () => {
      $.CONSUME(Derive);
      $.CONSUME(LParen);
      $.MANY(() => {
        $.CONSUME(TypeName, { LABEL: "traitName" });
        $.OPTION(() => $.CONSUME3(Comma));
      });
      $.CONSUME(RParen);
    })

    $.RULE("enumStatement", () => {
      $.OPTION(() => $.CONSUME(Pub))
      $.CONSUME(Enum);
      $.CONSUME(TypeName, { LABEL: "name" });
      $.CONSUME(LCurly);
      $.MANY(() => {
        $.SUBRULE($.enumMember);
        $.OPTION2(() => $.CONSUME2(Comma));
      });
      $.OPTION3(() => $.CONSUME(RCurly));
      $.OPTION4(() => $.SUBRULE($.deriveStatement));
    });

    $.RULE("traitStatement", () => {
      $.OPTION(() => $.CONSUME(Pub));
      $.CONSUME(Trait);
      $.CONSUME(TypeName, { LABEL: "name" });
      $.MANY(() => {
        $.CONSUME(Colon)
        $.CONSUME2(TypeName, { LABEL: "extends" });
      });
      $.CONSUME(LCurly);
      $.MANY2(() => {
        $.SUBRULE($.traitMemberStatement);
        $.OPTION2(() => $.CONSUME2(Comma));
      });
      $.OPTION3(() => $.CONSUME(RCurly));
      $.OPTION4(() => $.SUBRULE($.deriveStatement));
    });

    // op_equal(Self, Self) -> Bool
    $.RULE("traitMemberStatement", () => {
      $.SUBRULE($.functionName);
      $.CONSUME(LParen);
      $.MANY(() => {
        $.SUBRULE2($.typeStatement, { LABEL: "arg" });
        $.OPTION2(() => $.CONSUME2(Comma));
      });
      $.CONSUME(RParen);
      $.CONSUME(Arrow);
      $.SUBRULE($.typeStatement, { LABEL: "returnType" });
    });

    $.RULE("testStatement", () => {
      $.CONSUME(Test);
      $.OPTION(() => $.CONSUME(StringLiteral));
      $.SUBRULE($.blockStatement);
    });


    $.RULE("structStatement", () => {
      $.CONSUME(Struct);
      $.CONSUME(TypeName, { LABEL: "name" });
      $.CONSUME(LCurly);
      $.MANY(() => {
        $.SUBRULE($.structMemberStatement);
      });
      $.OPTION(() => $.CONSUME(RCurly));
      $.OPTION2(() => $.SUBRULE($.deriveStatement));
    });

    $.RULE("structMemberStatement", () => {
      $.OPTION(() => $.CONSUME(Mut));
      $.SUBRULE($.functionName, { LABEL: "name" });
      $.CONSUME(Colon);
      $.SUBRULE($.typeStatement, { LABEL: "type" });
    });

    $.RULE("fnStatement", () => {
      $.OPTION(() => $.CONSUME(Pub));
      $.CONSUME(Fn);

      $.OPTION2(() => $.SUBRULE2($.functionName));

      $.CONSUME(LParen);
      $.MANY2(() => [
        $.SUBRULE2($.argumentStatement),
        $.OPTION3(() => $.CONSUME(Comma)),
      ]);
      $.CONSUME(RParen);
      $.CONSUME(Arrow);
      $.SUBRULE($.typeStatement), $.SUBRULE($.blockStatement);
    });

    // 这里修改之后，expression函数中的判断也要同步修改
    $.RULE("expression", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.fnStatement) },
        { ALT: () => $.SUBRULE($.structStatement) },
        { ALT: () => $.SUBRULE($.traitStatement) },
        { ALT: () => $.SUBRULE($.testStatement) },
        { ALT: () => $.SUBRULE($.letStatement) },
        { ALT: () => $.SUBRULE($.enumStatement) },
        { ALT: () => $.SUBRULE($.ifStatement) },
        { ALT: () => $.SUBRULE($.whileStatement) },
        { ALT: () => $.SUBRULE($.forStatement) },
        { ALT: () => $.SUBRULE($.matchStatement) },
        { ALT: () => $.SUBRULE($.mapStatement) },
        { ALT: () => $.SUBRULE($.assignmentStatement) },
        { ALT: () => $.SUBRULE($.comparisonExpression) },
      ]);
    });

    // while
    $.RULE("whileStatement", () => {
      $.CONSUME(While);
      $.SUBRULE($.expression, { LABEL: "condition" });
      $.SUBRULE($.blockStatement, { LABEL: "body" });
    });

    // for i = n - 1; i > 0; i = i - 1 { }
    $.RULE("forStatement", () => {
      $.CONSUME(For);
      $.SUBRULE($.expression, { LABEL: "initialization" });
      $.CONSUME(Semicolon);
      $.SUBRULE2($.expression, { LABEL: "condition" });
      $.CONSUME2(Semicolon);
      $.SUBRULE3($.expression, { LABEL: "iteration" });
      $.SUBRULE($.blockStatement, { LABEL: "body" });
    });

    // match
    $.RULE("matchStatement", () => {
      $.CONSUME(Match);
      $.SUBRULE($.expression, { LABEL: "condition" });
      $.SUBRULE($.blockStatement, { LABEL: "body" });
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
      // $.MANY(() => {
      //   $.SUBRULE($.expression); // Handle multiple expressions inside the block
      //   $.OPTION(() => $.CONSUME(Semicolon)); // Optional semicolon
      // });
      $.SUBRULE($.row);
      $.OPTION(() => $.CONSUME(RCurly));
    });

    $.RULE("mapEntryStatement", () => {
      $.SUBRULE($.functionName, { LABEL: "key" });
      $.CONSUME(Colon);
      $.SUBRULE($.expression, { LABEL: "value" });
    });

    $.RULE("mapStatement", () => {
      $.CONSUME(LCurly);
      $.MANY(() => {
        $.SUBRULE($.mapEntryStatement);
        $.OPTION2(() => $.CONSUME(Comma));
      })
      $.OPTION(() => $.CONSUME(RCurly));
    });

    $.RULE("letStatement", () => {
      $.CONSUME(Let); // 可选的 "mut" 关键字
      $.OPTION(() => $.CONSUME(Mut)); // 可选的 "mut" 关键字
      $.SUBRULE($.functionName, { LABEL: "lhs" });
      $.OPTION2(() =>
        $.MANY(() => [$.CONSUME(Colon), $.SUBRULE2($.typeStatement)])
      ),
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
        { ALT: () => $.SUBRULE($.visitStatement) },
        { ALT: () => $.SUBRULE($.parenthesisExpression) },
        { ALT: () => $.CONSUME(DoubleLiteral) },
        { ALT: () => $.CONSUME(IntegerLiteral) },
        { ALT: () => $.CONSUME(StringLiteral) },
        { ALT: () => $.SUBRULE($.functionCall) },
        // { ALT: () => $.SUBRULE($.functionName) },
      ])
    );

    $.RULE("functionCall", () => {
      $.SUBRULE($.functionName);
      // $.SUBRULE($.tupleExpression);
      // $.CONSUME(LParen);
      $.MANY(() => {
        $.SUBRULE($.tupleExpression);
      });
      // $.CONSUME(RParen);
    });

    $.RULE("functionName", () => {
      $.CONSUME(FunctionName, { LABEL: "functionName" });
    });

    $.RULE("functionTypeStatement", () => {
      $.CONSUME(LParen);
      $.MANY(() => {
        $.SUBRULE2($.typeStatement);
        $.OPTION(() => $.CONSUME(Comma)); // Handle multiple arguments
      });
      $.CONSUME(RParen);
      $.CONSUME(Arrow);
      $.SUBRULE($.typeStatement, { LABEL: "returnType" });
    });

    $.RULE("typeStatement", () => {
      $.OR([
        { ALT: () => $.SUBRULE($.functionTypeStatement) },
        { ALT: () => $.CONSUME(TypeName) },
      ])
      $.MANY2(() => {
        $.CONSUME(LBracket);
        $.MANY3(() => {
          $.SUBRULE2($.typeStatement, { LABEL: "genericType" });
          $.OPTION2(() => $.CONSUME(Comma));
        });
        $.CONSUME(RBracket);
      })
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
  whileStatement(): CstNode {
    return notImplemented();
  }
  forStatement(): CstNode {
    return notImplemented();
  }
  matchStatement(): CstNode {
    return notImplemented();
  }
  fnStatement(): CstNode {
    return notImplemented();
  }
  deriveStatement(): CstNode {
    return notImplemented();
  }
  enumStatement(): CstNode {
    return notImplemented();
  }
  mapStatement(): CstNode {
    return notImplemented();
  }
  mapEntryStatement(): CstNode {
    return notImplemented();
  }
  visitStatement(): CstNode {
    return notImplemented();
  }
  enumMember(): CstNode {
    return notImplemented();
  }
  argumentStatement(): CstNode {
    return notImplemented();
  }
  functionName(): CstNode {
    return notImplemented();
  }
  typeStatement(): CstNode {
    return notImplemented();
  }
  traitStatement(): CstNode {
    return notImplemented();
  }
  structMemberStatement(): CstNode {
    return notImplemented();
  }
  structStatement(): CstNode {
    return notImplemented();
  }
  testStatement(): CstNode {
    return notImplemented();
  }
  traitMemberStatement(): CstNode {
    return notImplemented();
  }
  functionTypeStatement(): CstNode {
    return notImplemented();
  }
  tupleExpression(): CstNode {
    return notImplemented();
  }
  functionCall(): CstNode {
    return notImplemented();
  }
  pipelineExpression(): CstNode {
    return notImplemented();
  }
  blockStatement(): CstNode {
    return notImplemented();
  }
  additionExpression(): CstNode {
    return notImplemented();
  }
  multiplicationExpression(): CstNode {
    return notImplemented();
  }
  comparisonExpression(): CstNode {
    return notImplemented();
  }
  atomicExpression(): CstNode {
    return notImplemented();
  }
  parenthesisExpression(): CstNode {
    return notImplemented();
  }
  row(): CstNode {
    return notImplemented();
  }
  expression(): CstNode {
    return notImplemented();
  }
  ifStatement(): CstNode {
    return notImplemented();
  }
  letStatement(): CstNode {
    return notImplemented();
  }
  assignmentStatement(): CstNode {
    return notImplemented();
  }
}
function notImplemented(): never {
  throw new Error("Method not implemented.");
}

// wrapping it all together
// reuse the same parser instance.
const parser = new MoonBitPure();

// ----------------- Interpreter -----------------
const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

class MoonBitInterpreter extends BaseCstVisitor {
  scopes: Record<string, MoonBitValue>[] = [{}]; // Initialize with a global scope
  typeScopes: Record<string, MoonBitType>[] = [{}]; // Initialize with a global scope

  constructor() {
    super();
    // This helper will detect any missing or redundant methods on this visitor
    this.validateVisitor();
  }

  whileStatement(ctx: any) {
    // console.log("whileStatement", JSON.stringify(ctx, null, 2));
    const body = ctx.body; // Get body

    this.checkBlockStatementClose(body[0].children);

    const condition = ctx.condition; // Get condition
  
    // Execute the body while the condition is true
    while (this.visit(condition).value) {
      this.visit(body);
    }
  }

  forStatement(ctx: any) {
    const body = ctx.body; // Get body

    this.checkBlockStatementClose(body[0].children);

    console.log("forStatement", ctx);
    const initialization = ctx.initialization; // Get initialization
    const condition = ctx.condition; // Get condition
    const iteration = ctx.iteration; // Get iteration

    // Execute the body while the condition is true
    for (this.visit(initialization); this.visit(condition).value; this.visit(iteration)) {
      this.visit(body);
    }
  }

  traitMemberStatement(ctx: any) {
    // console.log("traitMemberStatement", ctx);
    const argsType = ctx.arg?.map((typeCtx: any) => this.visit(typeCtx)); // Get args type
    const returnType = this.visit(ctx.returnType); // Get return type
    return new MoonBitFunctionType(argsType, returnType);
  }

  traitStatement(ctx: any) {
    this.checkBlockStatementClose(ctx);
    // console.log("traitStatement", ctx);
    const name = ctx.name[0].image; // Get trait name
    const members = ctx.traitMemberStatement?.map((memberCtx: any) => this.visit(memberCtx)); // Get members
    const extend = ctx.extends?.map((traitCtx: any) => this.visit(traitCtx)); // Get extends
    // console.log("traitStatement", name, members, extend);
    // const 

    // Execute the body while the condition is true
    const trait = new MoonBitTrait(name, members, extend);

    // Store the trait in the traitScopes
    this.typeScopes[0][name] = trait;
  }
  structMemberStatement(ctx: any) {
    console.log("structMemberStatement", ctx);
    const name = this.visit(ctx.name); // Get struct member name
    const type = this.visit(ctx.type); // Get type
    const options = {
      isMutable: ctx.Mut !== undefined,
    }

    return new MoonBitStructMemberType(name, type, options);
  }

  structStatement(ctx: any) {
    this.checkBlockStatementClose(ctx);
    console.log("structStatement", ctx);
    const name = ctx.name[0].image; // Get struct name
    const members = ctx.structMemberStatement?.map((memberCtx: any) => this.visit(memberCtx)); // Get members
    const derives = this.visit(ctx.deriveStatement); // Get derives


    // Execute the body while the condition is true
    const struct = new MoonBitStruct(name, members, derives);

    // Store the struct in the typeScopes
    this.typeScopes[0][name] = struct;
  }

  matchStatement(ctx: any) {
    const body = ctx.body; // Get body
    this.checkBlockStatementClose(body[0].children);
    // console.log("matchStatement", ctx);
    const condition = this.visit(ctx.condition); // Get condition


    // Execute the body while the condition is true
    if (this.visit(condition)) {
      this.visit(body);
    }
  }
  mapStatement(ctx: any) {
    // console.log("mapStatement", ctx);
    this.checkBlockStatementClose(ctx);
    const entries = ctx.mapEntryStatement?.map((memberCtx: any) => this.visit(memberCtx)); // Get members
    return new MoonBitMap(entries);
  }
  mapEntryStatement(ctx: any) {
    // console.log("mapEntryStatement", ctx);
    const key = new MoonBitValue(this.visit(ctx.key), MoonBitType.String); // Get key
    const value = this.visit(ctx.value); // Get value
    return new MoonBitMapEntry(key, value);
  }
  visitStatement(ctx: any) {
    console.log("visitStatement", ctx);
    const lhs: MoonBitValue = this.getVariable(this.visit(ctx));
    const rhs: MoonBitValue = this.visit(ctx); // Get rhs

    if (lhs instanceof MoonBitMap) {
      return lhs.get(rhs)
    }
  }
  enumMember(ctx: any) {
    // console.log("enumMember", ctx);
    const name = ctx.name[0].image; // Get enum value
    const associatedTypes = ctx.associatedType?.map((typeCtx: any) => this.visit(typeCtx)); // Get associated types
    return new MoonBitEnumMemberType(name, associatedTypes);
  }

  deriveStatement(ctx: any) {
    // console.log("deriveStatement", ctx);
    const traitNames = ctx.traitName.map((traitCtx: any) => traitCtx.image); // Get traits

    const traits = traitNames.map((traitName: string) => {
      const trait = this.getTrait(traitName);
      if (!trait) {
        throw new MoonBitError(ctx, `Trait ${traitName} not found.`, MoonBitErrorType.TraitNotFound);
      }
      return trait;
    });
    return traits;
  }

  getTrait(traitName: string) {
    // Implement logic to retrieve the trait from the traitScopes
    // For simplicity, let's assume traits are stored in the global scope
    return this.typeScopes[0][traitName];
  }

  enumStatement(ctx: any) {
    // console.log("enumStatement", ctx);
    const name = ctx.name[0].image; // Get enum name
    const values = ctx.enumMember.map((memberCtx: any) => this.visit(memberCtx)); // Get enum values
    const derives = ctx.deriveStatement?.map((deriveCtx: any) => this.visit(deriveCtx)); // Get derives

    this.checkBlockStatementClose(ctx);

    // Assign the enum to the global scope
    // console.log(JSON.stringify(new MoonBitEnum(name, values, derives), null, 2))
    return (this.typeScopes[0][name] = new MoonBitEnum(name, values, derives));
  }

  fnStatement(ctx: any) {
    // console.log("fnStatement", ctx);
    const functionName = this.visit(ctx.functionName); // Get function name
    const args: MoonBitArgument[] =
      ctx.argumentStatement?.map((argCtx: any) => this.visit(argCtx)) ?? []; // Get arguments
    const returnType = this.visit(ctx.typeStatement); // Get return type
    const block = ctx.blockStatement; // Get function block

    this.checkBlockStatementClose(block[0].children);

    // console.log("functionName", functionName);
    // console.log("args", args);
    // console.log("returnType", returnType);

    // Create a new function object
    const fn = new MoonBitFunction(
      args,
      returnType,
      (...params: MoonBitValue[]) => {
        // Create a new scope for the function
        this.scopes.push({});
        // Assign arguments to the function scope
        // console.log("args", args);
        // console.log("params", params);
        params.forEach((arg: MoonBitValue, idx: number) => {
          MoonBitType.checkValueTypeWithError(arg, args[idx].type);

          this.scopes[this.scopes.length - 1][args[idx].name] = arg;
        });

        // Execute the function block
        const result = this.visit(block);

        // Remove the function scope
        this.scopes.pop();

        return result as MoonBitValue;
      }
    );

    // Assign the function to the global scope
    return (this.scopes[0][functionName] = fn);
  }

  argumentStatement(ctx: any) {
    const argName = this.visit(ctx.name); // Get argument name
    const argType = this.visit(ctx.type); // Get argument type
    return new MoonBitArgument(argName, argType);
  }

  testStatement(ctx: any) {
    // console.log("testStatement", ctx);
    const test = this.visit(ctx.blockStatement); // Evaluate condition
    return test;
  }

  ifStatement(ctx: any) {
    // console.log("ifStatement", ctx);
    const condition = this.visit(ctx.comparisonExpression); // Evaluate condition
    // console.log("condition", condition);
    // return condition;
    if (condition) {
      // If the condition is true, evaluate the 'then' block
      return this.visit(ctx.blockStatement);
    } else {
      // Check for else if or else
      // ctx.ifStatement?.forEach((elseIfCtx: any) => {
      if (ctx.elseifStatement) {
        for (let i = 0; i < ctx.elseifStatement.length; i++) {
          const elseIfCtx = ctx.elseifStatement[i].children;
          // console.log("elseIfCtx", elseIfCtx);
          const elseIfCondition = this.visit(elseIfCtx.comparisonExpression); // Evaluate else if condition
          if (elseIfCondition) {
            // If else if condition is true, evaluate the 'else if' block
            return this.visit(elseIfCtx.blockStatement);
          }
          if (elseIfCtx.elseStatement) {
            return this.visit(elseIfCtx.elseStatement);
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
    const varName = this.visit(ctx.lhs); // Get variable name
    const value = this.visit(ctx.rhs); // Evaluate expression
    const scope = this.getVariableScope(varName) ?? this.scopes[0]; // Get the variable scope

    // console.log("assignmentStatement", varName, value);
    // 检查变量是否 writable
    if (Object.getOwnPropertyDescriptor(scope, varName)?.writable === false) {
      throw new Error(`Variable ${varName} is not mutable.`);
    }

    if (
      scope[varName] instanceof MoonBitValue &&
      value instanceof MoonBitValue
    ) {
      MoonBitType.checkValueTypeWithError(value, scope[varName].type);
    }

    scope[varName] = value; // Store variable in current scope

    return value;
  }

  // 处理 let 声明

  letStatement(ctx: any) {
    // console.log("letStatement", ctx);
    const varName = this.visit(ctx.lhs); // Get variable name
    const type = this.visit(ctx.typeStatement); // Get variable type
    const value = this.visit(ctx.rhs); // Evaluate expression
    // console.log("value", value);
    // console.log("type", type)
    if (type !== undefined) {
      MoonBitType.checkValueTypeWithError(value, type);
    }

    // const moonBitValue = new MoonBitValue(value, moonBitType);
    Object.defineProperty(this.scopes[0], varName, {
      value: value,
      writable: ctx.Mut !== undefined,
      enumerable: true,
      configurable: true,
    });
    // this.scopes[0][varName] = value; // Store variable in current scope
    return value;
  }

  checkBlockStatementClose(ctx: any) {
    // console.log("checkBlockStatementClose", ctx);
    if (ctx.LCurly && !ctx.RCurly) {
      throw new MoonBitError(
        ctx,
        "missing `}`",
        MoonBitErrorType.MissingRCurly
      );
    }
  }

  blockStatement(ctx: any) {
    // console.log("blockStatement", ctx);
    this.checkBlockStatementClose(ctx);
    this.scopes.push({}); // Create a new scope
    const result = this.visit(ctx.row); // Visit all expressions in the block
    this.scopes.pop(); // Exit the scope
    return result;
  }

  // Additional methods for handling variable lookups, etc.
  getVariable(name: string) {
    // console.log("getVariable", name, this.scopes);
    for (let i = this.scopes.length - 1; i >= 0; i--) {
      if (this.scopes[i][name] !== undefined) {
        // console.log("getVariable", name, this.scopes[i][name]);
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
    if (ctx.pipelineExpression) {
      const length = ctx.pipelineExpression.length;
      for (let i = 0; i < length - 1; i++) {
        this.visit(ctx.pipelineExpression[i]);
      }
      // console.log(length);
      return this.visit(ctx.pipelineExpression[length - 1]);
    }
  }

  expression(ctx: any) {
    // console.log("expression", ctx);
    if (ctx.fnStatement) {
      return this.visit(ctx.fnStatement);
    } else if (ctx.letStatement) {
      return this.visit(ctx.letStatement);
    } else if (ctx.traitStatement) {
      return this.visit(ctx.traitStatement);
    } else if (ctx.testStatement) {
      return this.visit(ctx.testStatement);
    } else if (ctx.structStatement) {
      return this.visit(ctx.structStatement);
    } else if (ctx.ifStatement) {
      return this.visit(ctx.ifStatement);
    } else if (ctx.enumStatement) {
      return this.visit(ctx.enumStatement);
    } else if (ctx.matchStatement) {
      return this.visit(ctx.matchStatement);
    } else if (ctx.whileStatement) {
      return this.visit(ctx.whileStatement);
    } else if (ctx.forStatement) {
      return this.visit(ctx.forStatement);
    } else if (ctx.assignmentStatement) {
      return this.visit(ctx.assignmentStatement);
    } else if (ctx.mapStatement) {
      return this.visit(ctx.mapStatement);
    } else if (ctx.blockStatement) {
      return this.visit(ctx.blockStatement);
    } else if (ctx.comparisonExpression) {
      return this.visit(ctx.comparisonExpression);
    }
  }

  additionExpression(ctx: any) {
    // console.log("additionExpression", ctx);
    let result = this.visit(ctx.lhs);

    // "rhs" key may be undefined as the grammar defines it as optional (MANY === zero or more).
    if (ctx.rhs) {
      ctx.rhs.forEach(
        (rhsOperand: CstNode | CstNode[], idx: string | number) => {
          // there will be one operator for each rhs operand
          let rhsValue = this.visit(rhsOperand);
          let operator = ctx.AdditionOperator[idx];

          // console.log("result", result);
          // console.log("operator", operator);
          // console.log("rhsValue", rhsValue);
          MoonBitType.checkValueTypeWithError(rhsValue, result.type);
          if (tokenMatcher(operator, Plus)) {
            result = new MoonBitValue(
              result.value + rhsValue.value,
              result.type
            );
          } else {
            // Minus
            result = new MoonBitValue(
              result.value - rhsValue.value,
              result.type
            );
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
      ctx.rhs.forEach((rhsOperand: CstNode | CstNode[], idx: number) => {
        // there will be one operator for each rhs operand
        let rhs = this.visit(rhsOperand);
        let rhsValue = rhs.value;
        let operator = ctx.ComparisonOperator[idx];
        let lhsValue = result.value;
        // console.log("comparisonExpression", result, operator, rhs);

        MoonBitType.checkValueTypeWithError(rhs, result.type);

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
      });
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
          let rhs = this.visit(rhsOperand);
          let rhsValue = rhs.value;
          let operator = ctx.MultiplicationOperator[idx];

          MoonBitType.checkValueTypeWithError(rhs, result.type);

          if (tokenMatcher(operator, Multi)) {
            result = new MoonBitValue(result * rhsValue, result.type)
          } else {
            // Division
            result = new MoonBitValue(result / rhsValue, result.type)
          }
        }
      );
    }

    return result;
  }

  atomicExpression(ctx: any) {
    if (ctx.functionName) {
      const varName = this.visit(ctx.functionName); // Get the variable name
      return this.getVariable(varName);
    } else if (ctx.visitStatement) {
      return this.visit(ctx.visitStatement);
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
        Number.parseInt(ctx.IntegerLiteral[0].image, 10),
        MoonBitType.Int
      );
    } else if (ctx.DoubleLiteral) {
      // If a key exists on the ctx, at least one element is guaranteed
      return new MoonBitValue(
        Number.parseFloat(ctx.DoubleLiteral[0].image),
        MoonBitType.Double
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

        if (func instanceof MoonBitFunction) {
          // this.callFunction(func, result);
          // console.log("func", func);
          result = func.value(result); // Call the function with the result
        } else {
          throw new Error(`Unsupported expression after the pipe operator`);
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
    // console.log("tupleExpression", ctx);
    return ctx.expression?.map((expr: any) => this.visit(expr)) ?? [];
  }

  // Visit a function call
  functionCall(ctx: any) {
    // console.log(JSON.stringify(ctx, null, 2));
    let result = this.getVariable(this.visit(ctx.functionName)); // Get the function name
    if (ctx.tupleExpression) {
      for (const tuple of ctx.tupleExpression) {
        const args = this.visit(tuple);
        // console.log("args", args);
        // console.log("functionName", functionName)
        result = result.value(...args);
      }
    }
    // // console.log(args);
    // // console.log("functionName", functionName)
    // return this.callFunction(functionName, args);
    return result;
  }

  callFunction(name: string, args: MoonBitValue[]) {
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
      if (args.length < func.args.length) {
        return new MoonBitFunction(
          func.args.slice(func.args.length - args.length),
          func.returnType,
          (...params) => {
            return func.value(...params, ...args);
          }
        );
        // throw new Error(`Expected ${func.args.length} arguments, got ${args.length}`);
      } else if (args.length > func.args.length) {
        throw new Error(
          `Expected ${func.args.length} arguments, got ${args.length}`
        );
      }
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

  functionTypeStatement(ctx: any) {
    // console.log("functionTypeStatement", ctx);
    // Function Type
    const returnType = this.visit(ctx.returnType);
    // console.log("returnType", returnType);
    const args = ctx.typeStatement.map((type: any) => this.visit(type));
    // console.log("args", args);
    return new MoonBitFunctionType(args, returnType);
  }
  typeStatement(ctx: any) {
    // console.log("typeStatement", ctx);
    if (ctx.functionTypeStatement) {
      return this.visit(ctx.functionTypeStatement);
    }
    return MoonBitType.matchFromTypeName(this.typeScopes, ctx.TypeName[0].image);
  }
}

class MoonBitVM {
  interpreter: MoonBitInterpreter;

  constructor() {
    this.interpreter = new MoonBitInterpreter();

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
          console.log(arg.toString());
          return new MoonBitValue(arg.toString(), MoonBitType.Unit);
        }
      )
    );

    // this.interpreter.addFunction(
    //   "double",
    //   new MoonBitFunction(
    //     [new MoonBitArgument("arg", MoonBitType.Int)],
    //     MoonBitType.Double,
    //     (arg: MoonBitValue) => {
    //       return new MoonBitValue(arg.value * 2, MoonBitType.Double);
    //     }
    //   )
    // );
  }

  // Evaluate an expression in the current scope
  eval(input: string) {
    const lexResult = CalculatorLexer.tokenize(input);
    parser.input = lexResult.tokens;
    const cst = parser.row();
    // console.log("cst", cst);
    // console.log("lexResult", lexResult);
    const value = this.interpreter.visit(cst);

    return value;
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

// const vm = new MoonBitVM();
// console.log(vm.eval('"haha" |> println')); // 输出 haha 返回 undefined
// console.log(vm.eval("1 |> double()")); // 返回 2

// const vm = new MoonBitVM();
// vm.eval('let str: String = "haha"');
// console.log(vm.eval("str")); // 返回 haha

// const vm = new MoonBitVM();
// vm.eval("fn add(a: Int, b: Int) -> Int { a + b }");
// console.log(vm.eval("add(1, 2)")); // 返回 3


// const vm = new MoonBitVM();
// vm.eval("fn double(x: Int) -> Int { x*2 }");
// console.log(vm.eval("double(2)")); // 返回 4

// const vm = new MoonBitVM();
// vm.eval("fn add(a: Int, b: Int) -> Int { a + b }");
// console.log(vm.eval("1 |> add(2)")); // 返回 3

// const vm = new MoonBitVM();
// vm.eval("fn echo(str: String) -> Unit { println(str) }");
// vm.eval("echo(\"hello\")"); // 输出 hello

// const vm = new MoonBitVM();
// vm.eval("fn echo() -> (String) -> Unit { println }");
// vm.eval('echo()("hello")'); // 输出 hello

// const vm = new MoonBitVM();
// vm.eval('1 + "2"'); // Type mismatch: expected [Int], got [String]

// const vm = new MoonBitVM();
// vm.eval('1 * "2"'); // Type mismatch: expected [Int], got [String]

// const vm = new MoonBitVM();
// vm.eval("fn add(a: Int, b: Int) -> Int { a + b }");
// vm.eval('add(1,"2")'); // Type mismatch: expected [Int], got [String]

// const vm = new MoonBitVM();
// vm.eval("if 1 < 2 {");

// const vm = new MoonBitVM();
// vm.eval("fn add(a: Int, b: Int) -> Int {");

// const vm = new MoonBitVM();
// vm.eval(`let mut a = 0
// while a < 10 {
//   a = a + 1
//  println(a)
// }`); // 输出 1 到 10

// const vm = new MoonBitVM();
// vm.eval("1.1+1.0 |> println"); // 输出 2.1


// const vm = new MoonBitVM();
// vm.eval(`for i = 0; i < 10; i=i+1 {
//   println(i) 
// }`); // 输出 0 到 9


// const vm = new MoonBitVM();
// vm.eval(`
// // pub trait Logger {
// // }
// // pub trait Eq {
// //   op_equal(Self, Self) -> Bool
// // }
// // pub trait Show {
// //   output(Self, Logger) -> Unit
// //   to_string(Self) -> String
// // }

// struct Point {
//   x: Int
//   y: Int
// }

// // pub enum Json {
// //   Null
// //   True
// //   False
// //   Number(Double)
// //   String(String)
// // } derive(Eq)

// let a: Point = { x: 1, y: 2 }
// println(a)
// `);

// const vm = new MoonBitVM();
// vm.eval(`
//   struct Point {
// `); // error: missing `}`


export { MoonBitVM, strictMode };

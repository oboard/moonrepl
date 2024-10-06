enum MoonBitErrorType {
  MissingRCurly = 0,
  TypeMismatch = 1,
  TraitNotFound = 2,
  MissingReturnType = 3,
  UnsupportedExpressionAfterPipeOperator = 4,
  InvalidArgumentType = 5,
}

class MoonBitError extends Error {
  ctx: any;
  type: MoonBitErrorType;

  constructor(ctx: any, message: string, type: MoonBitErrorType) {
    super(message);
    this.ctx = ctx;
    this.type = type;
  }
}

export { MoonBitError, MoonBitErrorType };

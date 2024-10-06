enum MoonBitErrorType {
  MissingRCurly,
  TypeMismatch,
  TraitNotFound,
  MissingReturnType,
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

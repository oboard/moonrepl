import { MoonBitFunctionType, MoonBitType, MoonBitValue } from "./types";

class MoonBitFunction extends MoonBitValue {
  args: MoonBitArgument[] = [];
  returnType: MoonBitType = MoonBitType.Unit;
  // value: (...args: MoonBitValue[]) => MoonBitValue = () => {};

  constructor(
    args: MoonBitArgument[],
    returnType: MoonBitType,
    value: (...args: MoonBitValue[]) => MoonBitValue
  ) {
    const argsType = args.map((arg) => arg.type);
    super(value, new MoonBitFunctionType(argsType, returnType));
    this.args = args;
    this.returnType = returnType;
  }

  toString() {
    return `[${this.type.toString()}]`;
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

export { MoonBitFunction, MoonBitArgument };

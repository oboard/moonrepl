import { MoonBitType, MoonBitValue } from "./types";

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

  toString() {
    return `[(${this.args.map((arg) => arg.type.name).join(",")}) -> ${
      this.returnType.name
    }]`;
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

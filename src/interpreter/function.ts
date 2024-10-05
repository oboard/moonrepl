import { MoonBitType } from "./types";
import { MoonBitValue } from "./value";

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

class MoonBitArgument {
  name: string = "";
  type: MoonBitType = MoonBitType.String;

  constructor(name: string, type: MoonBitType) {
    this.name = name;
    this.type = type;
  }
}


export { MoonBitFunction, MoonBitArgument };
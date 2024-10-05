import { MoonBitType } from "./types";

class MoonBitValue {
  type: MoonBitType;
  value: any;

  static Unit = new MoonBitValue(undefined, MoonBitType.Unit);

  constructor(value: any, type?: MoonBitType) {
    if (type === undefined) {
      this.type = MoonBitType.matchTypeFromValue(value);
    } else {
      this.type = type;
    }
    this.value = value;
  }

  toString() {
    return this.value;
  }
}

export { MoonBitValue };

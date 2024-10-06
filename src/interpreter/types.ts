class MoonBitType {
  static matchTypeFromValue(value: any): MoonBitType {
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
  name: string = "Unit";

  static Unit = new MoonBitType("Unit");
  static Int = new MoonBitType("Int");
  static Double = new MoonBitType("Double");
  static String = new MoonBitType("String");
  static Bool = new MoonBitType("Bool");
  static Char = new MoonBitType("Char");
  static Function = new MoonBitType("Function");
  static Self = new MoonBitType("Self");

  constructor(name: string) {
    this.name = name;
  }

  static matchFromTypeName(strType: string) {
    switch (strType) {
      case "Unit":
        return MoonBitType.Unit;
      case "Int":
        return MoonBitType.Int;
      case "Double":
        return MoonBitType.Double;
      case "String":
        return MoonBitType.String;
      case "Bool":
        return MoonBitType.Bool;
      case "Char":
        return MoonBitType.Char;
      case "Self":
        return MoonBitType.Self;
      default:
        throw new Error(`Unknown type: ${strType}`);
    }
  }

  static checkValueTypeWithError(value: any, type: MoonBitType) {
    if (value instanceof MoonBitValue && type !== value.type) {
      throw new Error(`Type mismatch: expected ${type}, got ${value.type}`);
    }
  }
  static check(value: any, type: MoonBitType) {
    if (value instanceof MoonBitValue && value.type === type) {
      return true;
    } else {
      return false;
    }
  }

  toString() {
    return `[${this.name}]`;
  }
}

class MoonBitFunctionType extends MoonBitType {
  args: MoonBitType[];
  returnType: MoonBitType;

  constructor(args: MoonBitType[], returnType: MoonBitType) {
    super("Function");
    this.args = args;
    this.returnType = returnType;
  }

  toString(): string {
    return `(${this.args
      .map((arg) => arg.toString())
      .join(",")}) -> ${this.returnType.toString()}`;
  }
}

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

class MoonBitEnumMemberType extends MoonBitType {
  associatedTypes: MoonBitType[];
  constructor(name: string, associatedTypes: MoonBitType[]) {
    super(name);
    this.associatedTypes = associatedTypes;
  }

  toString() {
    return `${this.name}(${this.associatedTypes.join(", ")})`;
  }
}

class MoonBitTrait {
  name: string;
  members: MoonBitFunctionType[];
  extends: MoonBitTrait[];

  constructor(name: string, members: MoonBitFunctionType[], extendsTraits: MoonBitTrait[]) {
    this.name = name;
    this.members = members;
    this.extends = extendsTraits;
  }

  toString() {
    return `trait ${this.name} extends ${this.extends.join(", ")}`;
  }
}

class MoonBitEnum extends MoonBitType {
  values: MoonBitType[];
  derives: MoonBitTrait[];

  constructor(name: string, values: MoonBitType[], derives: MoonBitTrait[]) {
    super(name);
    this.values = values;
    this.derives = derives;
  }

  toString() {
    return `[\n  ${this.values.map((value) => value.toString()).join(",\n  ")}\n]`;
  }
}

export { MoonBitType, MoonBitTrait, MoonBitEnum, MoonBitEnumMemberType, MoonBitFunctionType, MoonBitValue };



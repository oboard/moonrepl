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
  static Map = new MoonBitType("Map");
  static Char = new MoonBitType("Char");
  static Function = new MoonBitType("Function");
  static Self = new MoonBitType("Self");

  constructor(name: string) {
    this.name = name;
  }

  static matchFromTypeName(typeScopes: Record<string, MoonBitType>[], strType: string) {
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
        for (let i = typeScopes.length - 1; i >= 0; i--) {
          const typeScope = typeScopes[i];
          if (typeScope[strType] !== undefined) {
            return typeScope[strType];
          }
        }
        throw new Error(`Unknown type: ${strType}`);
    }
  }


  // 递归比较两个 MoonBitType 是否相同
  // compareTypes(type1: MoonBitType, type2: MoonBitType): boolean {
  //   if (type1.key !== type2.key) return false;
  //   // 假设 toString 始终相同
  //   return true;
  // }

  // // 比较 MoonBitMapEntry 和 MoonBitStructMemberType
  // compareMapEntryAndStructMember(
  //   entry: MoonBitMapEntry,
  //   member: MoonBitStructMemberType
  // ): boolean {
  //   if (entry.key. !== member.key) return false;
  //   return compareTypes(entry.value.type, member.type);
  // }

  static checkValueTypeWithError(value: MoonBitValue, type: MoonBitType) {
    if (value instanceof MoonBitValue && type !== value.type) {
      if (type instanceof MoonBitStruct && value instanceof MoonBitMap) {
        const mapList = value.value.map((entry: MoonBitMapEntry) => {
          return {
            key: entry.key.value,
            type: entry.value.type
          }
        });
        const structList = type.members.map((entry: MoonBitStructMemberType) => {
          return {
            key: entry.key,
            type: entry.type
          }
        });
        if (mapList.length === structList.length) {
          for (let i = 0; i < mapList.length; i++) {
            const mapEntry = mapList[i];
            const structEntry = structList[i];
            if (mapEntry.key === structEntry.key && mapEntry.type.toString() === structEntry.type.toString()) {
              return;
            }
          }
        }
      }
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

interface MoonBitStructMemberTypeOptions {
  isMutable: boolean;
}

class MoonBitStructMemberType extends MoonBitType {
  key: string;
  type: MoonBitType;
  options: MoonBitStructMemberTypeOptions;

  constructor(key: string, type: MoonBitType, options: MoonBitStructMemberTypeOptions) {
    super(key);
    this.key = key;
    this.type = type;
    this.options = options;
  }

  toString() {
    return `${this.key}: ${this.type.toString()}`;
  }
}

class MoonBitStruct extends MoonBitType {
  members: MoonBitStructMemberType[];
  derives: MoonBitTrait[];

  constructor(name: string, members: MoonBitStructMemberType[], derives: MoonBitTrait[]) {
    super(name);
    this.members = members;
    this.derives = derives;
  }

  toString() {
    // return `struct ${this.name} {\n  ${this.members.map((member) => member.toString()).join(",\n  ")}\n}`;
    return `[${this.name}]`;
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

class MoonBitMap extends MoonBitValue {

  constructor(entries: MoonBitMapEntry[]) {
    super(entries, MoonBitType.Map);
  }

  get(key: MoonBitValue) {
    return this.value.find((value: any) => {
      if (value instanceof MoonBitMapEntry) {
        return value.key == key
      }
      return false;
    });
  }

  toString() {
    return `{ ${this.value.map((entry: MoonBitMapEntry) => entry.toString()).join(", ")} }`;
  }
}

class MoonBitMapEntry {
  key: MoonBitValue;
  value: MoonBitValue;

  constructor(key: MoonBitValue, value: MoonBitValue) {
    this.key = key;
    this.value = value;
  }

  toString() {
    return `${this.key.toString()}: ${this.value.toString()}`;
  }
}

export { MoonBitType, MoonBitMapEntry, MoonBitMap, MoonBitStruct, MoonBitStructMemberType, MoonBitTrait, MoonBitEnum, MoonBitEnumMemberType, MoonBitFunctionType, MoonBitValue };
export type { MoonBitStructMemberTypeOptions };



class MoonBitType {
  name: string = "Unit";

  static Unit = new MoonBitType("Unit");
  static Int = new MoonBitType("Int");
  static Double = new MoonBitType("Double");
  static String = new MoonBitType("String");
  static Bool = new MoonBitType("Bool");
  static Char = new MoonBitType("Char");
  static Function = new MoonBitType("Function");

  constructor(name: string) {
    this.name = name;
  }
}

export { MoonBitType };

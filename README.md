# MoonRepl

MoonBit Interpreter (Unofficial)

MoonRepl is an interpreter for the MoonBit programming language. It is an unofficial implementation of the MoonBit programming language. It is written in TypeScript.

## Try

### Online (Recommended)
https://moonrepl.oboard.eu.org/

### Local
1. Clone the repository
```bash
git clone https://github.com/oboard/moonrepl.git
```
2. Install dependencies
```bash
bun install # or npm install or yarn install or pnpm install
```
3. Start the program
#### Run .ts file with Deno or Bun.js
```bash
bun entry.ts # Recommended
deno run --allow-read --allow-write --unstable-sloppy-imports --allow-env
```

![MoonRepl Preview Image](screenshots/1.png)

## Features

- [x] Addition Expressions 加法运算
- [x] Subtraction Expressions 减法运算
- [x] Multiplication Expressions 乘法运算
- [x] Division Expressions 除法运算
- [x] Comparison Expressions 比较运算
- [x] Let Statement 变量声明
- [x] Let Mut Statement 变量声明（可变）
- [x] Strict Mode 严格模式
- [x] Template String 模板字符串
- [x] Basic Types (Int, Double, String, Bool, Char) 基本类型
- [x] Function Types 函数类型
- [x] If Statement If 语句
- [x] Types Check 类型检查
- [x] Multiline Input 多行输入
- [x] Functions 函数
- [x] While Statement While 循环
- [x] For Statement For 循环
- [ ] For Else 循环的Else
- [x] Comment 注释
- [x] Enum 枚举
- [x] Struct 结构体
- [x] Derive 派生
- [x] Pipeline 管道运算符
- [x] Trait 特征
- [ ] Trait Function 特征函数
- [ ] Trait Type Check 特征类型检查
- [ ] Trait Inheritance 特征继承
- [ ] Trait Default Implementations 特征默认实现
- [ ] Array 数组
- [ ] Json 序列化
- [ ] Match Statement 模式匹配
- [ ] Match Statement 模式匹配
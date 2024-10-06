# MoonRepl

MoonBit Interpreter (Unofficial)

MoonRepl is an interpreter for the MoonBit programming language. It is an unofficial implementation of the MoonBit programming language. It is written in TypeScript.

![MoonRepl Preview Image](screenshots/1.png)

## Try

### Online
https://moonrepl.oboard.eu.org/

### Local
1. Clone the repository
```bash
git clone https://github.com/oboard/moonrepl.git
```
2. Install dependencies
```bash
npm install
yarn install
pnpm install
bun install
```
3. Start the program
```bash
deno run --allow-read --allow-write entry.ts
bun entry.ts
```

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
- [x] Comment 注释
- [x] Enum 枚举
- [x] Struct 结构体
- [x] Derive 派生
- [x] Trait 特征
- [ ] Loop Statement Loop 循环
- [ ] Match Statement 模式匹配
import readline from 'node:readline';
import process from 'node:process';
import chalk from 'chalk';
import { MoonBitVM, helloWorld } from './src/interpreter/index.ts';
import { MoonBitError, MoonBitErrorType } from './src/interpreter/error.ts';
import { MoonBitType, MoonBitValue } from './src/interpreter/types.ts';

console.log(helloWorld);
let accumulatedInput = ''; // 存储多行输入

const vm = new MoonBitVM();


// 创建 readline 接口，用于从控制台读取输入
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

// 函数来处理用户输入的表达式
function evaluateExpression(expression) {

    // console.log(`Evaluating: ${accumulatedInput}`)
    const result = vm.eval(accumulatedInput);
    if (result instanceof MoonBitValue && result.type !== MoonBitType.Unit) {
        console.log(`${result}`);
    }
    accumulatedInput = '';

}


// 开始 REPL 提示符
rl.prompt();

// 处理用户每次输入的数据
rl.on('line', (input) => {
    try {
        accumulatedInput += `${input}\n`; // 将用户输入追加到累积的表达式中
        if (input.trim() === 'exit') {
            rl.close(); // 输入 'exit' 时退出 REPL
        } else {
            evaluateExpression(input); // 计算输入的表达式
        }
        accumulatedInput = ''; // 表达式计算完成后清空累积的表达式
    } catch (e: unknown) {
        if (e instanceof MoonBitError) {
            if (e.type === MoonBitErrorType.MissingRCurly) {
                rl.setPrompt('... ');
                rl.prompt();
                return;
            }
        }
        console.error(`${e}`);
        accumulatedInput = '';
    }
    rl.setPrompt('> ');
    rl.prompt(); // 再次显示提示符
});

let confirmClose = false;

// 处理 ctrl-c 事件
rl.on('SIGINT', () => {
    // 如果已经输入了内容，则抛弃输入内容，并显示提示符
    if (rl.line.length > 0 || accumulatedInput.length > 0) {
        // 抛弃输入内容
        accumulatedInput = '';
        // 换行
        console.log();
        rl.line = '';
        // 显示提示符
        rl.setPrompt('> ');
        rl.prompt();
        return;
    }
    if (confirmClose) {
        rl.close();
    } else {
        console.log(chalk.cyan('🔄 Press ') + chalk.yellowBright('Ctrl-C ') + chalk.cyan('again to exit 🛑'));
        confirmClose = true;
        setTimeout(() => {
            confirmClose = false;
        }, 5000);
        rl.prompt();
    }
});

// 处理退出事件
rl.on('close', () => {
    console.log(chalk.blueBright('🌙✨ ') + chalk.yellow('Byebye~ ') + chalk.magentaBright('MoonREPL! ') + chalk.green('👋😊'));
    process.exit(0);
});
import readline from 'readline';
import process from 'process';
import { MoonBitVM, helloWorld } from './src/interpreter/index.ts';
import { MoonBitError, MoonBitErrorType } from './src/interpreter/error.ts';

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
    if (result !== undefined) {
        console.log(`${result}`);
    }
    accumulatedInput = '';

}


// 开始 REPL 提示符
rl.prompt();

// 处理用户每次输入的数据
rl.on('line', (input) => {
    try {
        accumulatedInput += input + '\n'; // 将用户输入追加到累积的表达式中
        if (input.trim() === 'exit') {
            rl.close(); // 输入 'exit' 时退出 REPL
        } else {
            evaluateExpression(input); // 计算输入的表达式
        }
        rl.setPrompt('> ');
        rl.prompt(); // 再次显示提示符
    } catch (e: unknown) {
        if (e instanceof MoonBitError) {
            if (e.type === MoonBitErrorType.MissingRCurly) {
                rl.setPrompt('... ');
                rl.prompt();
                return;
            }
        } else {
            console.error(`Error: ${e}`);
        }
    }
});

// 处理退出事件
rl.on('close', () => {
    console.log('Exiting MoonREPL');
    process.exit(0);
});
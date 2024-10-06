<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import "@xterm/xterm/css/xterm.css";
import { MoonBitVM, helloWorld } from './interpreter/index';
import { MoonBitError, MoonBitErrorType } from './interpreter/error';
import { MoonBitFunction } from './interpreter/function';
import { MoonBitType, MoonBitValue } from './interpreter/types';


const vm = new MoonBitVM();

// ANSI 转义码定义
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
// const YELLOW = "\x1b[33m";
const RED = "\x1b[31m";
// const BLUE = "\x1b[34m";
// const MAGENTA = "\x1b[35m";
// const CYAN = "\x1b[36m";
// const WHITE = "\x1b[37m";



// Create a ref for the terminal element
const terminalRef = ref<HTMLElement | null>(null);
let term: Terminal = new Terminal({
    theme: {
        foreground: '#dcdcdc', // 字体颜色（浅灰色）
        background: '#2e3440', // 背景颜色（深灰蓝色）
        cursor: '#d8dee9', // 光标颜色（浅灰蓝色）
        selectionBackground: '#4c566a', // 选中文本背景颜色（中灰蓝色）
        selectionForeground: '#eceff4', // 选中文本前景颜色（近乎白色）
        selectionInactiveBackground: '#3b4252', // 非激活状态下的选中文本背景（更深的灰蓝色）
        black: '#3b4252', // 黑色（深灰蓝色）
        red: '#bf616a', // 红色（柔和的红色）
        green: '#a3be8c', // 绿色（柔和的绿色）
        yellow: '#ebcb8b', // 黄色（浅黄色）
        blue: '#81a1c1', // 蓝色（柔和的蓝色）
        magenta: '#b48ead', // 品红（淡紫色）
        cyan: '#88c0d0', // 青色（柔和的青色）
        white: '#e5e9f0', // 白色（浅灰色）
        brightBlack: '#4c566a', // 亮黑色（稍亮的灰蓝色）
        brightRed: '#d08770', // 亮红色（温暖的橙红色）
        brightGreen: '#8fbcbb', // 亮绿色（浅青绿）
        brightYellow: '#d8dee9', // 亮黄色（柔和的浅黄色）
        brightBlue: '#5e81ac', // 亮蓝色（浅灰蓝色）
        brightMagenta: '#a3be8c', // 亮品红（浅淡紫色）
        brightCyan: '#81a1c1', // 亮青色（柔和的浅青色）
        brightWhite: '#eceff4' // 亮白色（接近白色）
    },
    fontFamily: 'Menlo, courier-new, courier, monospace',
});
const fitAddon = new FitAddon();

const handleResize = () => {
    if (term && terminalRef.value) {
        fitAddon.fit();
    }
};
onMounted(() => {
    if (terminalRef.value) {
        term.loadAddon(fitAddon);
        term.open(terminalRef.value);
        handleResize();


        // 添加内置函数
        vm.interpreter.addFunction(
            "println",
            new MoonBitFunction(
                [
                    {
                        type: MoonBitType.String,
                        name: "arg",
                    },
                ],
                MoonBitType.Unit,
                (arg: MoonBitValue) => {
                    term.writeln(`${arg.toString()}`);
                    return new MoonBitValue(arg.toString(), MoonBitType.Unit);
                }
            )
        );

        // 监听窗口大小变化
        window.addEventListener('resize', handleResize);

        // 输出彩色字符
        term.writeln(helloWorld);


        let inputBuffer = ''; // 存储用户输入
        let multilineBuffer = ''; // 存储多行输入
        let history: string[] = []; // 历史记录
        let historyIndex = -1; // 当前历史记录索引
        let cursorPosition = 0; // 光标位置

        const writePrompt = () => {
            if (multilineBuffer.indexOf("\n") !== -1) {
                term.write(`${GREEN}... ${RESET} `)
                return;
            }
            term.write(`${GREEN}❯ ${RESET}`); // 显示提示符
        };
        writePrompt();


        const refreshLine = () => {
            term.write('\r\x1b[K'); // 清除当前行
            writePrompt(); // 重新显示提示符
            term.write(inputBuffer); // 显示当前输入
            // 移动光标到正确的位置
            const moveBack = inputBuffer.length - cursorPosition;
            if (moveBack > 0) {
                term.write(`\x1b[${moveBack}D`);
            }
        };

        const multilinePrompt = () => {
            historyIndex = history.length;
            history.push(inputBuffer);
            inputBuffer = '';
            writePrompt();
        }

        // 自定义事件处理程序，允许 Ctrl+V/Cmd+V 粘贴
        term.attachCustomKeyEventHandler((event) => {
            // console.log("event", event)
            if (event.key === 'Enter' && event.shiftKey && event.type === "keydown") {
                term.write('\r\n'); // 换行
                multilineBuffer += '\n' + inputBuffer;
                multilinePrompt()
                return false; // Prevent further processing of this Enter key
            }

            if (event.key === 'Enter' && event.type === "keypress") {
                return false;
            }

            if ((event.ctrlKey || event.metaKey) && event.key === "v") {
                return true; // 允许 Ctrl+V 或 Cmd+V 粘贴
            }
            return true; // 继续处理其他按键
        });

        // 捕获粘贴数据
        term.onData((data) => {
            const key = data;
            switch (key) {
                case '\r': // 回车键
                    term.write('\r\n'); // 换行
                    if (inputBuffer === 'clear') {
                        term.clear();
                        inputBuffer = multilineBuffer = ''; // 清空输入缓冲区
                        cursorPosition = 0; // 重置光标位置
                        writePrompt(); // 重新显示提示符
                        break;
                    }
                    if (multilineBuffer.length > 0) {
                        multilineBuffer += '\n' + inputBuffer;
                    } else {
                        multilineBuffer = inputBuffer;
                    }
                    try {
                        // console.log("inputBuffer", inputBuffer);
                        // console.log("multilineBuffer", multilineBuffer)
                        const result = vm.eval(multilineBuffer); // 执行表达式
                        if (result instanceof MoonBitValue && result.type !== MoonBitType.Unit) {
                            term.writeln(`${result}`); // 显示结果
                        }
                        multilineBuffer = '';
                    } catch (e: unknown) {
                        if (e instanceof MoonBitError) {
                            if (e.type === MoonBitErrorType.MissingRCurly) {
                                multilineBuffer += '\n';
                                multilinePrompt();
                                return;
                            }
                        }
                        term.writeln(`${RED}${e}${RESET}`);
                        multilineBuffer = '';
                    }

                    if (inputBuffer) {
                        history.push(inputBuffer); // 将输入内容添加到历史记录
                        historyIndex = history.length; // 重置历史索引
                    }
                    inputBuffer = ''; // 清空输入缓冲区
                    cursorPosition = 0; // 重置光标位置
                    writePrompt(); // 重新显示提示符
                    break;
                case '\x7f': // 退格键
                    if (cursorPosition > 0 && inputBuffer.length > 0) {
                        inputBuffer =
                            inputBuffer.slice(0, cursorPosition - 1) + inputBuffer.slice(cursorPosition);
                        cursorPosition--; // 光标向左移动一位
                        refreshLine(); // 刷新当前行
                    }
                    break;
                case '\x03': // Ctrl + C
                    term.write('\r\n'); // 换行
                    inputBuffer = ''; // 清空输入缓冲区
                    cursorPosition = 0; // 重置光标位置
                    writePrompt(); // 重新显示提示符
                    break;
                case '\u001b[D': // 左箭头键
                    if (cursorPosition > 0) {
                        cursorPosition--;
                        term.write('\x1b[D'); // 光标向左移动
                    }
                    break;

                case '\u001b[C': // 右箭头键
                    if (cursorPosition < inputBuffer.length) {
                        cursorPosition++;
                        term.write('\x1b[C'); // 光标向右移动
                    }
                    break;

                case '\u001b[B': // 下箭头键
                    if (historyIndex < history.length - 1) {
                        historyIndex++;
                        inputBuffer = history[historyIndex];
                        cursorPosition = inputBuffer.length; // 将光标移到行尾
                        refreshLine();
                    } else if (historyIndex == history.length) {
                        // 当处于最底端时清空输入框
                        historyIndex++;
                        inputBuffer = '';
                        cursorPosition = 0;
                        refreshLine();
                    }
                    break;

                case '\u001b[A': // 上箭头键
                    if (historyIndex > 0) {
                        historyIndex--;
                        inputBuffer = history[historyIndex];
                        cursorPosition = inputBuffer.length; // 将光标移到行尾
                        refreshLine();
                    }
                    break;

                default:
                    if (key === undefined) break;
                    // 插入字符到当前光标位置
                    inputBuffer =
                        inputBuffer.slice(0, cursorPosition) + key + inputBuffer.slice(cursorPosition);
                    cursorPosition++; // 光标位置向右移动一位
                    term.write(key); // 显示输入内容
                    // refreshLine(); // 刷新行
                    break;
            }
        });

        // term.onKey(e => {
        //     const key = e.key;

        // });
    }
});

onBeforeUnmount(() => {
    // 清理事件监听器
    window.removeEventListener('resize', handleResize);
});
</script>

<template>
    <!-- Bind the ref to the terminal div -->
    <div ref="terminalRef" class="w-screen h-screen">

    </div>
</template>

<style>
.terminal {
    padding: 1rem;
}
</style>
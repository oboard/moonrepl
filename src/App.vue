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

// Function to check if a character is CJK (2-column wide in terminals)
const isWideChar = (char: string) => {
    const code = char.charCodeAt(0);
    return (code >= 0x1100 && code <= 0x115F) || // Hangul Jamo
        (code >= 0x2E80 && code <= 0xA4CF) || // CJK Radicals Supplement to Yi Radicals
        (code >= 0xAC00 && code <= 0xD7A3) || // Hangul Syllables
        (code >= 0xF900 && code <= 0xFAFF) || // CJK Compatibility Ideographs
        (code >= 0xFE30 && code <= 0xFE4F) || // CJK Compatibility Forms
        (code >= 0xFF00 && code <= 0xFFEF);   // Halfwidth and Fullwidth Forms
};


// Create a ref for the terminal element
const terminalRef = ref<HTMLElement | null>(null);
const term: Terminal = new Terminal({
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
        const history: string[] = []; // 历史记录
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
                multilineBuffer += `\n${inputBuffer}`;
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
                        multilineBuffer += `\n${inputBuffer}`;
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
                case '\x7f': // Backspace key
                    if (cursorPosition > 0 && inputBuffer.length > 0) {
                        const charToDelete = inputBuffer[cursorPosition - 1];
                        inputBuffer =
                            inputBuffer.slice(0, cursorPosition - 1) + inputBuffer.slice(cursorPosition);
                        cursorPosition--; // Move cursor left

                        if (isWideChar(charToDelete)) {
                            term.write('\x1b[D\x1b[D'); // Move cursor 2 positions left for wide chars
                        } else {
                            term.write('\x1b[D'); // Move cursor 1 position left for regular chars
                        }

                        refreshLine(); // Refresh the current line to reflect the updated input
                    }
                    break;
                case '\x03': // Ctrl + C
                    term.write('\r\n'); // 换行
                    inputBuffer = ''; // 清空输入缓冲区
                    cursorPosition = 0; // 重置光标位置
                    writePrompt(); // 重新显示提示符
                    break;

                // Assuming inputBuffer is an array of characters (string[]).
                case '\u001b[D': // Left arrow key
                    if (cursorPosition > 0) {
                        const prevChar = inputBuffer[cursorPosition - 1];
                        cursorPosition--;
                        if (isWideChar(prevChar)) {
                            term.write('\x1b[D\x1b[D'); // Move cursor 2 positions left for wide chars
                        } else {
                            term.write('\x1b[D'); // Move cursor 1 position left for regular chars
                        }
                    }
                    break;

                case '\u001b[C': // Right arrow key
                    if (cursorPosition < inputBuffer.length) {
                        const nextChar = inputBuffer[cursorPosition];
                        cursorPosition++;
                        if (isWideChar(nextChar)) {
                            term.write('\x1b[C\x1b[C'); // Move cursor 2 positions right for wide chars
                        } else {
                            term.write('\x1b[C'); // Move cursor 1 position right for regular chars
                        }
                    }
                    break;

                case '\u001b[B': // 下箭头键
                    if (historyIndex < history.length - 1) {
                        historyIndex++;
                        inputBuffer = history[historyIndex];
                        cursorPosition = inputBuffer.length; // 将光标移到行尾
                        refreshLine();
                    } else if (historyIndex === history.length) {
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
                    cursorPosition += key.length; // 光标位置向右移动一位
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
    <a href="https://github.com/oboard/moonrepl" target="_blank" class="fixed top-4 right-8 text-white hover:text-gray-300 active:text-gray-500">
        <svg width="24px" height="24px" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd"
                d="M16 0C7.16 0 0 7.3411 0 16.4047C0 23.6638 4.58 29.795 10.94 31.9687C11.74 32.1122 12.04 31.6201 12.04 31.1894C12.04 30.7998 12.02 29.508 12.02 28.1341C8 28.8928 6.96 27.1293 6.64 26.2065C6.46 25.7349 5.68 24.279 5 23.8893C4.44 23.5818 3.64 22.823 4.98 22.8025C6.24 22.782 7.14 23.9919 7.44 24.484C8.88 26.9652 11.18 26.268 12.1 25.8374C12.24 24.7711 12.66 24.0534 13.12 23.6433C9.56 23.2332 5.84 21.8183 5.84 15.5435C5.84 13.7594 6.46 12.283 7.48 11.1347C7.32 10.7246 6.76 9.04309 7.64 6.78745C7.64 6.78745 8.98 6.35682 12.04 8.46893C13.32 8.09982 14.68 7.91527 16.04 7.91527C17.4 7.91527 18.76 8.09982 20.04 8.46893C23.1 6.33632 24.44 6.78745 24.44 6.78745C25.32 9.04309 24.76 10.7246 24.6 11.1347C25.62 12.283 26.24 13.7389 26.24 15.5435C26.24 21.8388 22.5 23.2332 18.94 23.6433C19.52 24.1559 20.02 25.1402 20.02 26.6781C20.02 28.8723 20 30.6358 20 31.1894C20 31.6201 20.3 32.1327 21.1 31.9687C27.42 29.795 32 23.6433 32 16.4047C32 7.3411 24.84 0 16 0Z"
                fill="currentColor"></path>
        </svg>
    </a>
</template>

<style>
.terminal {
    padding: 1rem;
}
</style>
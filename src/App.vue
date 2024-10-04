<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import "@xterm/xterm/css/xterm.css";
import { evaluateExpression } from './interpreter/index';

// ANSI 转义码定义
const RESET = "\x1b[0m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
// const RED = "\x1b[31m";
// const BLUE = "\x1b[34m";
// const MAGENTA = "\x1b[35m";
// const CYAN = "\x1b[36m";
// const WHITE = "\x1b[37m";

// Create a ref for the terminal element
const terminalRef = ref<HTMLElement | null>(null);
let term: Terminal = new Terminal({
    theme: {
        foreground: '#ffffff', // 字体颜色
        background: '#000000', // 背景颜色
        cursor: '#ffffff', // 光标颜色
        selectionBackground: '#ffffff', // 选中文本背景颜色
        selectionForeground: '#000000', // 选中文本前景颜色
        selectionInactiveBackground: '#ffffff', // 选中文本背景颜色
        black: '#000000', // 黑色
        red: '#ff0000', // 红色
        green: '#00ff00', // 绿色
        yellow: '#ffff00', // 黄色
        blue: '#0000ff', // 蓝色
        magenta: '#ff00ff', // 品红
        cyan: '#00ffff', // 青色
        white: '#ffffff', // 白色
        brightBlack: '#808080', // 亮黑色
        brightRed: '#ff8080', // 亮红色
        brightGreen: '#80ff80', // 亮绿色
        brightYellow: '#ffff80', // 亮黄色
        brightBlue: '#8080ff', // 亮蓝色
        brightMagenta: '#ff80ff', // 亮品红
        brightCyan: '#80ffff', // 亮青色
        brightWhite: '#ffffff' // 亮白色
    }
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

        // 监听窗口大小变化
        window.addEventListener('resize', handleResize);

        // 输出彩色字符
        term.writeln(`${GREEN}Welcome to MoonRepl! ${YELLOW}Made with ❤️ by oboard${RESET}`);

        const writePrompt = () => {
            term.write(`${GREEN}❯ ${RESET}`); // 显示提示符
        };
        writePrompt();

        let inputBuffer = ''; // 存储用户输入
        let history: string[] = []; // 历史记录
        let historyIndex = -1; // 当前历史记录索引

        term.onKey(e => {
            const key = e.key;

            switch (key) {
                case '\r': // 回车键
                    term.write('\r\n'); // 换行
                    const result = evaluateExpression(inputBuffer); // 执行表达式
                    console.log(result);
                    term.writeln(`${result}`); // 显示输入内容
                    if (inputBuffer) {
                        history.push(inputBuffer); // 将输入内容添加到历史记录
                        historyIndex = history.length; // 重置历史索引
                    }
                    inputBuffer = ''; // 清空输入缓冲区
                    writePrompt(); // 重新显示提示符
                    break;

                case '\x7f': // 退格键
                    if (inputBuffer.length > 0) {
                        inputBuffer = inputBuffer.slice(0, -1); // 移除最后一个字符
                        term.write('\b \b'); // 在终端中显示退格效果
                    }
                    break;

                case '\u001b[B': // 下箭头键
                    if (historyIndex <= history.length - 1) {
                        historyIndex++;
                        inputBuffer = history[historyIndex];
                        term.write('\r\x1b[K'); // 清除当前行
                        writePrompt(); // 重新显示提示符
                        term.write(inputBuffer); // 显示历史记录内容
                    } else if (historyIndex == history.length) {
                        // 当处于最底端时清空输入框
                        historyIndex++;
                        inputBuffer = '';
                        term.write('\r\x1b[K'); // 清除当前行
                        writePrompt(); // 重新显示提示符
                    }
                    break;

                case '\u001b[A': // 上箭头键
                    if (historyIndex > 0) {
                        historyIndex--;
                        inputBuffer = history[historyIndex];
                        term.write('\r\x1b[K'); // 清除当前行
                        writePrompt(); // 重新显示提示符
                        term.write(inputBuffer); // 显示历史记录内容
                    }
                    break;
                default:
                    if (key === undefined) break;
                    inputBuffer += key; // 将按键添加到输入缓冲区
                    term.write(key); // 回显输入
            }
        });
    }
});

onBeforeUnmount(() => {
    // 清理事件监听器
    window.removeEventListener('resize', handleResize);
});

const run = async () => {
    // Add your code logic here
};
</script>

<template>

    <!-- Bind the ref to the terminal div -->
    <div ref="terminalRef"></div>

</template>

<style></style>
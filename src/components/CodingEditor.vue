<template>
    <div ref="editorContainer" style="height: 300px; min-width: 600px"></div>
</template>

<script setup lang="ts">
import * as monaco from "monaco-editor/esm/vs/editor/editor.main.js";
import { ref, onMounted, getCurrentInstance, watchEffect } from "vue";
import { language as languageTokens, conf as languageConfiguration } from "../config/moonbit.ts";

const props = defineProps<{
    value: any;
    language: any;
}>();
let editor: { setValue: (arg0: any) => void; getValue: () => any; } | null = null;
const proxy = getCurrentInstance()?.proxy;
watchEffect(() => {
    if (props.value) {
        editor?.setValue(props.value);
    }
});
onMounted(() => {
    monaco.languages.register({
        id: "moonbit",
    });
    monaco.languages.setMonarchTokensProvider("moonbit", languageTokens);
    // monaco.languages.setLanguageConfiguration("moonbit", languageConfiguration);
    editor = monaco.editor.create(proxy?.$refs.editorContainer, {
        value: props.value,
        readOnly: false,
        language: props.language,
        theme: "vs-dark",
        selectOnLineNumbers: true,
        automaticLayout: true,
        renderSideBySide: false,
    });
});
const getEditorValue = () => {
    return editor?.getValue();
};
const setEditorValue = (value: string) => {
    editor?.setValue(value);
};
//导出获取编辑器全部值的方法，在提交表单时给后端传值
defineExpose({
    getEditorValue,
    setEditorValue
});
</script>
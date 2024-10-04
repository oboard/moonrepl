import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import { presetUno, presetAttributify, presetIcons } from "unocss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [UnoCSS({
    presets: [
      presetUno({
        dark: "media",
      }),
      presetAttributify(),
      presetIcons({
        extraProperties: {
          display: "inline-block",
          "vertical-align": "middle",
        },
      }),
    ],
  }), vue()],
});

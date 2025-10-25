import { defineConfig } from "vite";

export default defineConfig({
  root: ".", // если index.html в корне
  build: {
    outDir: "product", // чтобы сборка шла в папку product, как у тебя было
    emptyOutDir: true,
  },
});

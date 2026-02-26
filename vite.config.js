import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";

export default defineConfig({
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    chunkSizeWarningLimit: 20000,
    rollupOptions: {
      output: {
        manualChunks: {
          vuetify: ["vuetify"],
          vue: ["vue", "vue-router", "pinia"],
          vendor: ["axios", "lodash", "cities.json"],
        },
      },
    },
  },
});

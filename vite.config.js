import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import { transformAssetUrls } from "vite-plugin-vuetify";
import eslintPlugin from "@nabla/vite-plugin-eslint";
import VitePluginBrowserSync from "vite-plugin-browser-sync";
import { chunkSplitPlugin } from "vite-plugin-chunk-split";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    cors: true,
    proxy: {
      "/api/weather": {
        target: "https://api.openweathermap.org",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            const url = new URL(req.url, "http://localhost");
            url.pathname = "/data/2.5/weather";
            url.searchParams.set("appid", process.env.APP_ID || "");
            proxyReq.path = url.pathname + url.search;
          });
        },
      },
      "/api/news": {
        target: "https://newsapi.org",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            const url = new URL(req.url, "http://localhost");
            url.pathname = "/v2/top-headlines";
            url.searchParams.set("apiKey", process.env.NEWS_API_KEY || "");
            proxyReq.path = url.pathname + url.search;
          });
        },
      },
      "/api/soccer": {
        target: "https://api.football-data.org",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq, req) => {
            const url = new URL(req.url, "http://localhost");
            const competition = url.searchParams.get("competition") || "PL";
            const matchStatus = url.searchParams.get("status");
            let path = `/v4/competitions/${competition}/matches`;
            if (matchStatus) path += `?status=${matchStatus}`;
            proxyReq.path = path;
            proxyReq.setHeader("X-Auth-Token", process.env.SOCCER_TOKEN || "");
          });
        },
      },
    },
  },
  build: {
    //target: 'es2015',
    target: "es2017",
    // minify: "esbuild",
    cssTarget: "chrome79",
    minify: "terser",
    reportCompressedSize: true,
    chunkSizeWarningLimit: 5000,
    terserOptions: {
      compress: {
        drop_console: false,
        pure_funcs: ["console.log", "console.info"],
        drop_debugger: true,
        toplevel: false,
      },
    },
    assetsDir: "static/assets",
    rollupOptions: {
      output: {
        chunkFileNames: "static/js/[name]-[hash].js",
        entryFileNames: "static/js/[name]-[hash].js",
        assetFileNames: "static/[ext]/[name]-[hash].[ext]",
      },
    },
  },
  base: "./",
  plugins: [
    chunkSplitPlugin(),
    vue({
      template: { transformAssetUrls },
    }),
    vuetify({ autoImport: true }),
    eslintPlugin(),
    VitePluginBrowserSync(),
  ],
});

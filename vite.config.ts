import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import copy from "rollup-plugin-copy";
import fs from "fs";

const wasmContentTypePlugin = {
  name: "wasm-content-type-plugin",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url.endsWith(".wasm")) {
        res.setHeader("Content-Type", "application/wasm");
        const newPath = req.url.replace("deps", "dist");
        const targetPath = path.join(__dirname, newPath);
        const wasmContent = fs.readFileSync(targetPath);
        return res.end(wasmContent);
      }
      next();
    });
  },
};

export default defineConfig(({ command }) => {
  if (command === "serve") {
    console.log("serve hereeee");
    return {
      build: {
        target: "esnext",
        rollupOptions: {
          external: ["@aztec/bb.js"],
        },
      },
      optimizeDeps: {
        esbuildOptions: {
          target: "esnext",
        },
      },
      plugins: [
        react(),
        copy({
          targets: [
            {
              src: "node_modules/**/*.wasm",
              dest: "node_modules/.vite/dist",
            },
          ],
          copySync: true,
          hook: "buildStart",
        }),
        command === "serve" ? wasmContentTypePlugin : [],
      ],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
    };
  }

  return {};
});

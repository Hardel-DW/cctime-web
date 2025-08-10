import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tanstackRouter({
            routesDirectory: "./src/routes",
            generatedRouteTree: "./src/routeTree.gen.ts"
        }),
        react(),
        tailwindcss()
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "@lib/*": path.resolve(__dirname, "./src/lib/*"),
            "@routes/*": path.resolve(__dirname, "./src/routes/*")
        }
    }
});

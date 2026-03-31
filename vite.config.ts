import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import checker from 'vite-plugin-checker';
import { visualizer } from 'rollup-plugin-visualizer';

const isAnalyze = process.env.ANALYZE === '1';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Dev-only: `pnpm build` already runs `tsc -b` before `vite build`.
    checker({ typescript: true, enableBuild: false }),
    ...(isAnalyze
      ? [
          visualizer({
            filename: 'build/stats.html',
            gzipSize: true,
            brotliSize: true,
          }) as PluginOption,
        ]
      : []),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    // Keep source maps useful for error reporting without exposing them publicly.
    sourcemap: 'hidden',
    emptyOutDir: true,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'amplify', test: /node_modules\/aws-amplify/ },
            {
              name: 'data-fetch',
              test: /node_modules\/(@tanstack\/react-query|openapi-)/,
            },
            { name: 'xyflow', test: /node_modules\/@xyflow/ },
            { name: 'headlessui', test: /node_modules\/@headlessui/ },
            { name: 'icons', test: /node_modules\/lucide-react/ },
            { name: 'react-router', test: /node_modules\/react-router/ },
            {
              name: 'forms',
              test: /node_modules\/(react-hook-form|@hookform\/resolvers|zod)/,
            },
            {
              name: 'react-vendor',
              test: /node_modules\/(react-dom|react\/|scheduler)/,
            },
          ],
        },
      },
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    open: true,
  },
  preview: {
    port: 3000,
  },
  // App is served under /v2/ in deployed environments.
  base: '/v2/',
});

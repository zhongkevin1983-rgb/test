import crypto from 'node:crypto';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';
import {defineConfig} from 'vite';

// Polyfill crypto.hash for older Node.js versions (e.g., < Node 21.7.0 or v20.12.0)
if (typeof (crypto as any).hash !== 'function') {
  (crypto as any).hash = function (algorithm: string, data: any, format: any = 'hex') {
    const hash = crypto.createHash(algorithm);
    hash.update(data);
    return hash.digest(format);
  };
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

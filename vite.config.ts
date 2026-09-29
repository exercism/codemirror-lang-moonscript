import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'CodeMirrorLangMoonScript',
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
      formats: ['es', 'cjs']
    },
    rollupOptions: {
      external: [
        '@codemirror/autocomplete',
        '@codemirror/language',
        '@codemirror/lint',
        '@codemirror/state',
        '@codemirror/view',
        '@lezer/highlight'
      ]
    }
  },
  server: {
    port: 3000,
    open: false
  }
});

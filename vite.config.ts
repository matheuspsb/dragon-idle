import { defineConfig } from 'vitest/config';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    target: 'esnext',
  },
  test: {
    exclude: ['**/node_modules/**', 'tests/e2e/**'],
  },
});

import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.integration.spec.ts'],
    globals: true,
    root: './',
    environment: 'node',
    testTimeout: 10000, // Longer timeout for real network calls
  },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
    }),
  ],
});

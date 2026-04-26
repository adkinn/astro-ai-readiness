import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'config': 'src/config.ts',
    'components/index': 'src/components/index.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  external: [/\.astro$/, 'astro', 'zod'],
  target: 'node18',
})

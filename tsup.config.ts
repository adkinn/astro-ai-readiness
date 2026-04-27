import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'components/index': 'src/components/index.ts',
    'components/types': 'src/components/types.ts',
    'utils/json-ld': 'src/utils/json-ld.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  external: [/\.astro$/, 'astro', 'zod'],
  target: 'node18',
})

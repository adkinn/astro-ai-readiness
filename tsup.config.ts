import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    'config': 'src/config.ts',
    'components/index': 'src/components/index.ts',
    'components/types': 'src/components/types.ts',
    'utils/json-ld': 'src/utils/json-ld.ts',
    'outputs/llms-txt': 'src/outputs/llms-txt.ts',
    'outputs/agents-md': 'src/outputs/agents-md.ts',
    'outputs/mcp-json': 'src/outputs/mcp-json.ts',
  },
  format: ['esm'],
  dts: true,
  clean: true,
  outDir: 'dist',
  external: [/\.astro$/, 'astro', 'zod'],
  target: 'node22',
})

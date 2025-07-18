import path from 'path';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const packages = [
  'inputs',
  'core',
  'outputs',
  'ai',
  'utils',
];

export default packages.map(pkg => ({
  input: `packages/${pkg}/src/index.ts`,
  output: [
    {
      file: `packages/${pkg}/dist/index.js`,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: `packages/${pkg}/dist/index.esm.js`,
      format: 'esm',
      sourcemap: true,
    },
  ],
  external: [
    'react',
    'react-dom',
    'openai',
  ],
  plugins: [
    resolve(),
    commonjs(),
    typescript({
      tsconfig: `packages/${pkg}/tsconfig.json`,
      useTsconfigDeclarationDir: true,
      clean: true,
    }),
  ],
})); 
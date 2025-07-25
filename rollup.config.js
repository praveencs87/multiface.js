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
  'fusion',
  'react-native',
  'sensors',
  'context',
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
    'react-native',
    'openai',
    'zustand',
    '@react-native-voice/voice',
    'react-native-camera',
    'react-native-gesture-handler',
    'react-native-sensors',
    '@react-native-async-storage/async-storage',
    '@react-native-community/geolocation',
    '@multiface.js/core',
    '@multiface.js/fusion',
    '@multiface.js/sensors',
  ],
  plugins: [
    resolve({
      preferBuiltins: false,
      browser: true,
    }),
    commonjs(),
    typescript({
      tsconfig: `packages/${pkg}/tsconfig.json`,
      useTsconfigDeclarationDir: true,
      clean: true,
    }),
  ],
})); 
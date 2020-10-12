import alias from '@rollup/plugin-alias'
import replace from '@rollup/plugin-replace'
import json from '@rollup/plugin-json'

import path from 'path'

import vue from 'rollup-plugin-vue'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
// @ts-ignore
import babel from '@rollup/plugin-babel'
import pkg from './package.json'

const packageRoot = path.resolve(__dirname)

export default {
  input: './tmp/index.js',
  output: {
    dir: 'lib',
    format: 'esm',
    preserveModules: true,
    sourcemap: false,
  },
  external: id => {
    if ([
      ...Object.keys(pkg.dependencies),
      '@microsoft/load-themed-styles',
      '@uifabric/set-version',
      '@uifabric/styling',
      'vue',
      'vue-tsx-support',
    ].indexOf(id) > -1) return true
    return /(@babel\/runtime)|(@uifabric\/styling)/gi.test(id)
  },
  plugins: [
    json(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),
    alias({
      resolve: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      entries: [
        { find: /^@\/(.*)/, replacement: path.resolve(packageRoot, 'src/$1') },
        { find: '@uifabric/utilities', replacement: '@uifabric-vue/utilities' },
      ],
    }),
    vue({
      css: false,
      template: {
        isProduction: true,
      },
    }),
    resolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      preferBuiltins: true,
    }),
    commonjs({
      include: /node_modules/,
      sourceMap: false,
    }),
    babel({
      exclude: /node_modules/,
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      babelrc: false,
      configFile: false,
      babelHelpers: 'runtime',
      presets: [
        ['@vue/cli-plugin-babel/preset', {
          modules: false,
          useBuiltIns: false,
          polyfills: [],
        }],
      ],
      plugins: [
        '@babel/plugin-transform-runtime',
      ],
    }),
  ],
}

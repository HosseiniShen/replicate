const path = require('path')
const pkg = require('../package.json')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const ts = require('rollup-plugin-typescript')

module.exports = {
  input: path.resolve(__dirname, '../src/index.ts'),

  output: {
    file: path.resolve(__dirname, '../', pkg.main),
    format: 'umd',
    name: 'Replicate'
  },

  plugins: [
    commonjs(),
    nodeResolve(),
    ts({
      exclude: "node_modules/**",
      typescript: require("typescript")
    })
  ]
}

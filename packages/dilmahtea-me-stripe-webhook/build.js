import esbuild from 'esbuild'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

esbuild.build({
  entryPoints: ['src/dev.js'],
  bundle: true,
  minify: false,
  format: 'esm',
  outfile: 'dist/worker.js',
  plugins: [NodeModulesPolyfillPlugin()],
  logLevel: 'info',
})

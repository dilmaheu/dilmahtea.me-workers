import esbuild from 'esbuild'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

const entry = process.argv[2] === '--dev' ? 'src/dev.js' : 'src/prod.js'

esbuild.build({
  entryPoints: [entry],
  bundle: true,
  minify: false,
  format: 'esm',
  outfile: 'dist/worker.js',
  plugins: [NodeModulesPolyfillPlugin()],
  logLevel: 'info',
})

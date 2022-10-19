import esbuild from 'esbuild'
import alias from 'esbuild-plugin-alias'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const entry = process.argv[2] === '--dev' ? 'src/dev.js' : 'src/prod.js'

esbuild.build({
  entryPoints: [entry],
  bundle: true,
  minify: false,
  format: 'esm',
  outfile: 'dist/worker.js',
  plugins: [
    // alias 'crypto' to 'crypto-browserify' manually
    alias({
      crypto: require.resolve('crypto-browserify'),
    }),
    // NodeGlobalsPolyfillPlugin doesn't polyfill crypto due to https://github.com/ionic-team/rollup-plugin-node-polyfills/issues/20
    NodeModulesPolyfillPlugin(),
    NodeGlobalsPolyfillPlugin({ buffer: true }),
  ],
  logLevel: 'info',
})

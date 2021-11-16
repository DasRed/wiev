import esbuild from 'esbuild';
import clear from 'esbuild-plugin-clear';
import time from 'esbuild-plugin-time';
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));


esbuild.build({
    entryPoints:   ['./src/index.js', './src/Wiev.js', './src/minifyTemplate.js', './src/template.js'],
    bundle:        true,
    minify:        true,
    sourcemap:     false,
    target:        ['esnext'],
    format:        'esm',
    legalComments: 'none',
    outdir:        './dist',
    plugins:       [
        clear('./dist'),
        time(),
    ],
});

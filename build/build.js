import esbuild from 'esbuild';
import clear from 'esbuild-plugin-clear';
import time from 'esbuild-plugin-time';

esbuild.build({
    entryPoints:   ['./src/index.js'],
    bundle:        true,
    minify:        true,
    sourcemap:     false,
    target:        ['esnext'],
    format:        'esm',
    legalComments: 'none',
    outfile:       './dist/index.js',
    plugins:       [
        clear('./dist'),
        time(),
    ],
});

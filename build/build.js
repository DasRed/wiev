import esbuild from 'esbuild';
import clear from 'esbuild-plugin-clear';
import time from 'esbuild-plugin-time';
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));


esbuild.build({
    entryPoints:   ['./src/index.js', './src/Wiev.js'],
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
        {
            name:  'NodeModulesResolver',
            setup: (build) => {
                build.onResolve({filter: /eventemitter0/}, (args) => {
                    return {path: __dirname + '/../node_modules' + args.path.substr(5), namespace: 'file'};
                });
            },
        }
    ],
});

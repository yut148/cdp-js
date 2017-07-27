﻿'use strict';

const path  = require('path');
const pkg   = require('./package.json');

const target = {
    type: 'classical-module',
    es: 'es5',
    module: 'none',
    env: 'web',
};

const dir = {
    src: 'src',
    pkg: 'dist',
    built: 'built',
    doc: 'docs',
    task: 'tasks',
    test: 'tests',
    types: '@types',
    temp: '.temp',
    external: 'external',
    script: 'scripts',
};

const external_rearrange = {
    root: `${dir.external}`,
    ignore_modules: [
        '^@types',
    ],
    specified_modules: [
        'hogan.js',
    ],
    module_adjuster: {
        'hogan.js': {
            vender: 'hogan',
            rename: 'hogan',
            cwd: './dist',
            dev: 'hogan-*.amd.js',
            prod: 'hogan-*.min.amd.js',
            ignore: {
                dev: ['*.min.amd.js'],
            },
        },
    },
};

const internal_rearrange = [
    'cdp-lazyload',
    'cdp-core',
    'cdp-promise',
];

const main = {
    basename: 'cdp.tools',
    bundle_d_ts: 'cdp.tools.d.ts',
    namespace: 'cdp',
};

const built_cleanee = {
    ts: ['**/*.js', '**/*.d.ts', '!**/index.d.ts', '**/*.map'],
    roots: [
        'exports',
        `${dir.src}/${dir.script}`,
    ],
};

const banner = {
    fileName: 'BANNER',
    d_ts_desc: '\n * This file is generated by the CDP package build process.',
};

const required_tasks = [
    'banner.js',
    'bundle.js',
    'clean.js',
    'external-rearrange.js',
    'internal-rearrange.js',
    'remap-coverage.js',
    'srcmap.js',
];

// project configuration
module.exports = {
    target: target,
    pkg: pkg,
    dir: dir,
    external_rearrange: external_rearrange,
    internal_rearrange: internal_rearrange,
    main: main,
    built_cleanee: built_cleanee,
    banner: banner,
    required_tasks: required_tasks,
};

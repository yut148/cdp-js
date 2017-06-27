﻿/* eslint-env node, es6 */
/* eslint-disable no-regex-spaces */
'use strict';
const fs        = require('fs');
const path      = require('path');
const glob      = require('glob');
const banner    = require('./banner');
const srcmap    = require('./srcmap');
const config    = require('../project.config');

const PACKAGE_NAME  = config.pkg.name;
const NAMESPACE     = config.main ? (config.main.namespace || '') : '';
const SOURCE_MAP_NAMESPACE = (() => {
    if (NAMESPACE) {
        return NAMESPACE + ':///' + PACKAGE_NAME + '/';
    } else {
        return PACKAGE_NAME + ':///';
    }
})();

///////////////////////////////////////////////////////////////////////
// common:

function update_srcmap_namespace(code, options) {
    let srcNode = srcmap.getNodeFromCode(code);
    return srcmap.getCodeFromNode(srcNode, options.srcmapRename, { multiline: options.multiline });
}

///////////////////////////////////////////////////////////////////////
// classical module:

function normalize_classical_module_src_copy() {
    const src = path.join(__dirname, '..', config.dir.built, config.main.basename + '.js');
    const dst = path.join(__dirname, '..', config.dir.pkg, config.main.basename + '.js');
    fs.writeFileSync(dst, fs.readFileSync(src).toString(), 'utf8');
}

function normalize_classical_module_d_ts() {
    const TYPE_DEF_FILE = path.join(__dirname, '..', config.dir.pkg, config.dir.types, config.main.bundle_d_ts);
    const SRC_DEF_FILE  = path.join(__dirname, '..', config.dir.built, config.main.basename + '-all.d.ts');

    let src = '\ufeff' + banner('.d.ts', config.main.basename) + fs.readFileSync(SRC_DEF_FILE).toString()
            .replace(/^\ufeff/gm, '')
            .replace(/\r\n/gm, '\n')
    ;

    const refPathInfo = [];
    const refPathDefs = src.match(/<reference path="[\s\S]*?"/g);

    if (null != refPathDefs) {
        refPathDefs.forEach((refpath) => {
            const filePath = refpath.match(/("|')[\s\S]*?("|')/)[0].replace(/("|')/g, '');
            const fileName = path.basename(filePath);
            refPathInfo.push({
                refpath: refpath,
                path: filePath,
                file: fileName,
            });
        });
        refPathInfo.forEach((target) => {
            src = src.replace(target.refpath, '<reference path="' + target.file + '"');
        });
        // remove '_dev.dependencies.d.ts' reference.
        src = src.replace(/\/\/\/ <reference path="_dev.dependencies.d.ts"[\s\S]*?\n/g, '');
    }

    fs.writeFileSync(TYPE_DEF_FILE, src);
}

///////////////////////////////////////////////////////////////////////
// library:

function normalize_src(src, options) {
    return '\ufeff' + update_srcmap_namespace(src, options)
        .replace(/^\ufeff/gm, '')    // remove bom
        .replace(/\t/gm, '    ')
        .replace(/\r\n/gm, '\n')
    ;
}

function normalize_lib_src(location) {
    const MAIN_FILE = path.join(__dirname, '..', location, config.main.basename + '.js');
    let src = fs.readFileSync(MAIN_FILE).toString();
    src = normalize_src(src, {
        srcmapRename: (srcPath) => {
            return srcPath
                .replace(`webpack:///${NAMESPACE}:/`, `${NAMESPACE}:///`)
                .replace(`webpack:///${config.dir.src}/`, SOURCE_MAP_NAMESPACE)
                .replace('webpack:/webpack', 'webpack:///webpack')
                .replace('webpack:/external', 'webpack:///external/')
                .replace('webpack:///~', 'webpack:///node_modules')
            ;
        },
        multiline: false,
    });
    fs.writeFileSync(MAIN_FILE, src, 'utf8');
}

function normalize_lib_d_ts() {
    const dts   = require('dts-bundle');
    const tsfmt = require('typescript-formatter');
    const TYPE_DEF_FILE = path.join(__dirname, '..', config.dir.pkg, config.dir.types, PACKAGE_NAME, config.main.bundle_d_ts);

    // concat d.ts
    dts.bundle(config.dts_bundle);

    // format d.ts
    tsfmt.processStream(TYPE_DEF_FILE, fs.createReadStream(TYPE_DEF_FILE), {
        tsfmt: tsfmt,
    })
    .then((content) => {
        let src = '\ufeff' + banner('.d.ts') + content.message
            .replace(/^\ufeff/gm, '')
            .replace(/\r\n/gm, '\n')
            .replace(/^\/\/ Generated by dts-bundle[\s\S]*?\n/g, '')
            .replace(/^        \*/gm, '     *')
            .replace(/^            \*/gm, '         *')
            .replace(/^                \*/gm, '             *')
            .replace(/'/gm, '"')
        ;
        fs.writeFileSync(TYPE_DEF_FILE, src);
    })
    .catch((error) => {
        console.error(error);
    });
}

///////////////////////////////////////////////////////////////////////
// for package:

function normalize_package_src() {
    const PKG_DIR = path.join(__dirname, '..', config.dir.pkg);
    glob.sync('**/?(*.js|*.css)', {
        cwd: PKG_DIR,
        nodir: true,
        ignore: [
            config.dir.external + '/**/*',
            config.dir.res + '/**/*',
            config.dir.template + '/**/*',
        ],
    }).forEach((file) => {
        console.log('  normalize... ' + file);
        const basename = path.basename(file).split('.');
        const srcPath = path.join(PKG_DIR, file);

        let src = fs.readFileSync(srcPath).toString().replace(/^\ufeff/gm, '');
        if (!/^\/\**!+/.test(src)) {
            // set banner
            const node = srcmap.getNodeFromCode(src);
            node.prepend(banner('.' + basename[1], basename[0]) + '\n');
            src = srcmap.getCodeFromNode(node);
        }
        src = normalize_src(src, {
            srcmapRename: (srcPath) => {
                const regex_src = new RegExp('^' + config.dir.src + '\\/');
                return srcPath
                    .replace('webpack:///' + config.dir.src + '/', SOURCE_MAP_NAMESPACE)
                    .replace('webpack:/webpack', 'webpack:///webpack')
                    .replace('webpack:/external', 'webpack:///external/')
                    .replace('webpack:///~', 'webpack:///node_modules')
                    .replace(/\.\.\//g, '')
                    .replace(regex_src, SOURCE_MAP_NAMESPACE + config.dir.src + '/')
                    .replace(/platforms\/\w+\//, SOURCE_MAP_NAMESPACE + config.dir.src + '/')
                ;
            },
            multiline: 'css' === basename[1].toLowerCase(),
        });
        fs.writeFileSync(srcPath, src, 'utf8');
    });
}

function main() {
    switch (config.target.type) {
        case 'classical-module':
            normalize_lib_src(config.dir.built);
            normalize_classical_module_src_copy();
            normalize_classical_module_d_ts();
            return;
        case 'library':
            normalize_lib_src(config.dir.pkg);
            normalize_lib_d_ts();
            return;
        case 'mobile':
            normalize_package_src();
            return;
        default:
            return;
    }
}

main();

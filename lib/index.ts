import type { Proce, CbNxt } from 'scpo-proce';
import { InConfig, configSchema } from './types';
import func2code = require('func2code');
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import schema2class = require('schema2class');
import scpoProce = require('scpo-proce');
import child_process = require('child_process');
import path = require('path');

/**
 * Test the compatibility of your code.
 * @version 1.0.2
 * @license GPL-3.0-or-later
 * @link https://github.com/E0SelmY4V/export-tester
 */
declare module '.';

type ModType = 'esm' | 'cjs' | 'ts';
type EnvirType = Exclude<InConfig['req'], undefined>[number]
const factory = schema2class(configSchema);
type Config = ReturnType<typeof factory>

function arr2obj<T extends readonly string[]>(arr: [...T]) {
	const obj = {} as { [I in T[number]]: 0 };
	arr.forEach(e => obj[e] = 0);
	return obj;
}
function rainbow(text: string, color: number | Config) {
	if (typeof color === 'number') console.log(`+-------------------\n| \x1b[${color}m ${text} \x1b[0m`);
	else if (color.disp.stat) console.log(`| ${text}`);
}
function allFunc<T extends string[]>(list: [...T], callback: Function) {
	const qObj = arr2obj(list);
	let i = list.length;
	return (n: T[number]) => n in qObj ? (--i, delete qObj[n], i || callback(), true) : false;
}
function proce(...list: CbNxt<[Error | null], [Error | null], [string, Error, ...any[]]>[]) {
	return scpoProce.snake(list).trap((n, ...errs) => console.error(`| \x1b[31m${n}\x1b[0m`, ...errs));
}
function fork(files: string[], todo: (err?: any) => void, conf: Config) {
	conf.disp.path && files.forEach(e => rainbow(`\x1b[4m\x1b[34m${path.normalize(__dirname + e)}\x1b[0m`, conf));
	child_process.fork(__dirname + files[0]).on('close', todo);
}
type ModStr = { [I in ModType]: string };
function getOut(type: ModType, ext: string) {
	return (str: string, n: ModStr, cb: () => void) =>
		fsp.writeFile(`${__dirname}/test/test.${ext}`, n[type] + str).then(cb);
}
function out<T extends EnvirType[]>(list: [...T], str: string, n: ModStr) {
	const fin: { [I in (typeof outMap)[T[number]]]?: 0 } = {};
	return scpoProce.snake(list.map(e => outMap[e]).map(e =>
		(todo: (() => void)) => e in fin ? todo() : (fin[e] = 0, outObj[e](str, n, todo))
	));
}
const outMap = {
	'ts': 'ts',
	'webpack-cjs': 'cjs',
	'webpack-esm': 'esm',
	'node-cjs': 'cjs',
	'node-esm': 'esm',
} as const;
const outObj = {
	esm: getOut('esm', 'm.js'),
	cjs: getOut('cjs', 'c.js'),
	ts: getOut('ts', 'ts'),
} as const;
const doObj = {
	ts(conf: Config) {
		rainbow('TS', 44);
		const ts = conf.cfg.ts;
		return proce(
			todo => {
				child_process.exec('tsc -v', todo);
				rainbow('Testing cli', conf);
			},
			(todo, ordo, err, so, se) => {
				if (err) return ordo('Have you installed "tsc" ?', err, so, se);
				rainbow('Compiling', conf);
				child_process.exec(
					`tsc${ts.path ? ' -p ' + path : ''} ${__dirname}/test/test.ts ${ts.cmd || ''}`,
					todo
				);
			},
			(todo, ordo, err, so, se) => {
				if (err) return ordo('Compilation failed.', err, so, se);
				fork(['/test/test.js', '/test/test.ts'], todo, conf);
			},
		);
	},
	node(conf: Config, n: 'm' | 'c') {
		return proce(
			todo => {
				rainbow('Copying test file', conf);
				fs.cp(`${__dirname}/test/test.${n}.js`, `${__dirname}/test/node.${n}js`, todo);
			},
			todo => {
				fork([`/test/node.${n}js`], todo, conf);
			},
		);
	},
	'node-esm'(conf: Config) {
		rainbow('Node ESM', 45);
		return doObj.node(conf, 'm');
	},
	'node-cjs'(conf: Config) {
		rainbow('Node CJS', 43);
		return doObj.node(conf, 'c');
	},
	webpack(conf: Config, n: 'm' | 'c') {
		const wp = conf.cfg.webpack;
		const cfg = `${__dirname}/test/webpack.config.js`;
		return proce(
			todo => {
				child_process.exec('webpack -h', todo);
				rainbow('Testing cli', conf);
			},
			(todo, ordo, err, so, se) => {
				if (err) return ordo('Have you installed "webpack" ?', err, so, se);
				rainbow('Copying configs', conf);
				if (wp.path) fs.cp(wp.path, cfg, todo);
				else fs.writeFile(cfg, '', todo);
			},
			(todo, ordo, err) => {
				if (err) return ordo('Cannot copy the config JS file.', err);
				rainbow('Modifying configs', conf);
				fs.writeFile(cfg, `
					;
					module || (module = {});
					module.exports  || (module.exports = {});
					module.exports.output  || (module.exports.output = {});
					module.exports.output.path = __dirname;
					module.exports.output.filename = 'webpack.${n}.js';
					module.exports.mode || (module.exports.mode = 'development');
					module.exports.entry = __dirname + '/test.${n}.js';
				`, { flag: 'a' }, todo);
			},
			(todo, ordo, err) => {
				if (err) return ordo('Cannot modify the config JS file.', err);
				rainbow('Compiling', conf);
				child_process.exec(
					`webpack ${wp.cmd || ''} -c ${__dirname}/test/webpack.config.js`,
					todo
				);
			},
			(todo, ordo, err, so, se) => {
				if (err) return ordo('Compilation failed.', err, so, se);
				fork([`/test/webpack.${n}.js`, `/test/test.${n}.js`], todo, conf);
			},
		);
	},
	'webpack-esm'(conf: Config) {
		rainbow('webpack ESM', 42);
		return doObj.webpack(conf, 'm');
	},
	'webpack-cjs'(conf: Config) {
		rainbow('webpack CJS', 46);
		return doObj.webpack(conf, 'c');
	},
};
function checkDir() {
	return scpoProce.snake(
		todo => fs.access(__dirname + '/test', fs.constants.F_OK, todo),
		(todo, ordo, err) => err ? fs.mkdir(__dirname + '/test', todo) : todo()
	);
}
async function test(n: InConfig, tests: { [name: string]: Function }) {
	await checkDir();
	await clear();
	const conf = factory(n);
	const findPath = JSON.stringify(conf.pack || './' + path.relative(__dirname + '/test', conf.file));
	const cjs = `var ${conf.sign}=require(${findPath});`;
	const esm = `import ${conf.sign} from ${findPath};`;
	const ts = `import ${conf.sign} ${conf.cfg.ts.cjsMod ? `=require(${findPath})` : `from ${findPath}`};`;
	let str = '\nfunction log(...params) { console.log("| ", ...params) }\n';
	for (var i in tests) str += ''
		+ `console.log('|\\n+-\\x1b[32m${JSON.stringify(i)}:\\x1b[0m');`
		+ `(function(){\n\n`
		+ func2code.getInnerCode(tests[i])
		+ `\n\n})();`;
	str += 'console.log("|");';
	await out(conf.req, str, { cjs, esm, ts, });
	await scpoProce.snake(conf.req.map(e => async todo => e in doObj ? (await doObj[e](conf), todo()) : todo()));
	return;
}
async function clear() {
	await checkDir();
	const list = await fsp.readdir(__dirname + '/test');
	await scpoProce.snake(list.map(e => todo => fs.unlink(`${__dirname}/test/${e}`, todo)));
}
test.clear = clear;
export = test;
test.test = test;
/**
 * Test the compatibility of your code.
 * @version 1.0.13
 * @license GPL-3.0-or-later
 * @link https://github.com/E0SelmY4V/export-tester
 */
declare module '.';

import * as child_process from 'child_process';
import * as fs from 'fs';
import * as fsp from 'fs/promises';
import func2code from 'func2code';
import * as path from 'path';
import type { CbNxt } from 'scpo-proce';
import * as scpoProce from 'scpo-proce';
import { configSchema, InConfig } from './types';
import schema2class = require('schema2class');

type ModType = 'esm' | 'cjs' | 'ts';
type EnvirType = Exclude<InConfig['req'], undefined>[number];
const factory = schema2class(configSchema);
type Config = ReturnType<typeof factory>;

function arr2obj<T extends readonly string[]>(arr: [...T]) {
	const obj = {} as { [I in T[number]]: 0 };
	arr.forEach(e => obj[e] = 0);
	return obj;
}
function rainbow(text: string, conf: Config, color: number | null = null) {
	if (!conf.disp) return;
	if (typeof color === 'number') console.log(`+-------------------\n| \x1b[${color}m ${text} \x1b[0m`);
	else if (typeof conf.disp === 'boolean' ? conf.disp : conf.disp.stat) console.log(`| ${text}`);
}
function allFunc<T extends string[]>(list: [...T], callback: Function) {
	const qObj = arr2obj(list);
	let i = list.length;
	return (n: T[number]) => n in qObj ? (--i, delete qObj[n], i || callback(), true) : false;
}
function proce(...list: CbNxt<[Error | null], [Error | null], [string, Error, ...any[]]>[]) {
	return scpoProce.snake(list).trap((n: void | string, ...errs) => {
		console.error(`| \x1b[31m${n}\x1b[0m`, ...errs);
		return n;
	});
}
function fork(files: [string, ...string[]], todo: (err?: any) => void, ordo: (msg: string, err: Error) => void, conf: Config) {
	if (typeof conf.disp === 'boolean' ? conf.disp : conf.disp.path) files.forEach(e => rainbow(`\x1b[4m\x1b[34m${path.normalize(testsDir + e)}\x1b[0m`, conf));
	child_process.fork(testsDir + files[0], conf.disp ? void 0 : {
		stdio: 'overlapped',
	}).on('close', num => num ? ordo('RE', Error(`Exit code is ${num}`)) : todo());
}
type ModStr = { [I in ModType]: string };
function getOut(type: ModType, ext: string) {
	return (str: string, n: ModStr) => fsp.writeFile(`${testsDir}/test.${ext}`, n[type] + str);
}
function out<T extends EnvirType[]>(list: [...T], str: string, n: ModStr) {
	const fin: { [I in (typeof outMap)[T[number]]]?: 0 } = {};
	return scpoProce.snake(list.map(e => outMap[e]).map(e =>
		async (todo: (() => void)) => e in fin ? todo() : (fin[e] = 0, await outObj[e]?.(str, n), todo())
	));
}
function waitCli(todo: (err: Error) => void, proc: child_process.ChildProcess) {
	return setTimeout(() => (todo(Error('Cli not respond')), proc.kill()), 5000);
}
const testsDir = path.join(__dirname, '../runtime');
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
		rainbow('TS', conf, 44);
		const ts = conf.cfg.ts;
		let timer: ReturnType<typeof waitCli>;
		let cmd = 'tsc';
		return proce(
			todo => {
				child_process.exec(`${cmd} -v`, todo);
				rainbow('Testing cli', conf);
			},
			(todo, ordo, err) => {
				if (!err) return todo(err);
				cmd = `npx ${cmd}`;
				const proc = child_process.exec(`${cmd} -v`, todo);
				timer = waitCli(todo, proc);
				rainbow('Testing npx cli', conf);
			},
			(todo, ordo, err, so, se) => {
				if (err) return ordo('Have you installed "tsc" ?', err, so, se);
				clearTimeout(timer);
				rainbow('Compiling', conf);
				child_process.exec(
					`${cmd} ${ts.path ? `-p ${ts.path}` : ''} ${testsDir}/test.ts ${ts.cmd || ''}`,
					todo
				);
			},
			(todo, ordo, err, so, se) => {
				if (err) return ordo('Compilation failed.', err, so, se);
				fork(['/test.js', '/test.ts'], todo, ordo, conf);
			},
		);
	},
	node(conf: Config, n: 'm' | 'c') {
		return proce(
			todo => {
				rainbow('Copying test file', conf);
				fs.cp(`${testsDir}/test.${n}.js`, `${testsDir}/node.${n}js`, todo);
			},
			(todo, ordo) => {
				fork([`/node.${n}js`], todo, ordo, conf);
			},
		);
	},
	'node-esm'(conf: Config) {
		rainbow('Node ESM', conf, 45);
		return doObj.node(conf, 'm');
	},
	'node-cjs'(conf: Config) {
		rainbow('Node CJS', conf, 43);
		return doObj.node(conf, 'c');
	},
	webpack(conf: Config, n: 'm' | 'c') {
		const wp = conf.cfg.webpack;
		const cfg = `${testsDir}/webpack.config.js`;
		let timer: ReturnType<typeof waitCli>;
		let cmd = 'webpack';
		return proce(
			todo => {
				child_process.exec(`${cmd} -h`, todo);
				rainbow('Testing cli', conf);
			},
			(todo, ordo, err) => {
				if (!err) return todo(err);
				cmd = `npx ${cmd}`;
				const proc = child_process.exec(`${cmd} -h`, todo);
				timer = waitCli(todo, proc);
				rainbow('Testing npx cli', conf);
			},
			(todo, ordo, err, so, se) => {
				if (err) return ordo('Have you installed "webpack" ?', err, so, se);
				clearTimeout(timer);
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
					`${cmd} ${wp.cmd || ''} -c ${testsDir}/webpack.config.js`,
					todo
				);
			},
			(todo, ordo, err, so, se) => {
				if (err) return ordo('Compilation failed.', err, so, se);
				fork([`/webpack.${n}.js`, `/test.${n}.js`], todo, ordo, conf);
			},
		);
	},
	'webpack-esm'(conf: Config) {
		rainbow('webpack ESM', conf, 42);
		return doObj.webpack(conf, 'm');
	},
	'webpack-cjs'(conf: Config) {
		rainbow('webpack CJS', conf, 46);
		return doObj.webpack(conf, 'c');
	},
} as const;
function checkDir() {
	return scpoProce.snake(
		todo => fs.access(testsDir, fs.constants.F_OK, todo),
		(todo, ordo, err) => err ? fs.mkdir(testsDir, todo) : todo()
	);
}
async function test(n: InConfig, tests: { [name: string]: Function; }) {
	await clear();
	const conf = factory(n);
	const findPath = JSON.stringify(conf.pack || './' + path.relative(testsDir, conf.file));
	const cjs = {
		all: `var ${conf.sign} = require(${findPath});`,
		def: `var ${conf.sign} = require(${findPath})["default"];`,
	}[conf.mode.imp];
	const esm = {
		all: `import * as ${conf.sign} from ${findPath};`,
		def: `import ${conf.sign} from ${findPath};`,
	}[conf.mode.imp];
	const ts = (conf.cfg.ts.noChk
		? '//@ts-nocheck\n'
		: ''
	) + {
		all: `import * as ${conf.sign} from ${findPath};`,
		def: `import ${conf.sign} from ${findPath};`,
		cjs: `import ${conf.sign} = require(${findPath});`,
	}[conf.cfg.ts.cjsMod ? 'cjs' : conf.mode.imp];
	let str = '\nfunction log(...params) { console.log("| ", ...params) }\n';
	for (var i in tests) str += ''
		+ `console.log('|\\n+-\\x1b[32m${JSON.stringify(i)}:\\x1b[0m');`
		+ `(function(){\n\n`
		+ func2code.getInnerCode(tests[i])
		+ `\n\n})();`;
	str += 'console.log("|");';
	await out(conf.req, str, { cjs, esm, ts, });
	const detail: { [name: string]: string; } = {};
	let err = 0;
	await scpoProce.snake(conf.req.map(e => async todo => {
		if (e in doObj) {
			const info = await doObj[e](conf);
			info && (detail[e] = info, err++);
		} else {
			detail[e] = 'No such testing enviroument';
			err++;
		}
		todo();
	}));
	return { err, detail };
}
async function clear() {
	await checkDir();
	const list = await fsp.readdir(testsDir);
	await scpoProce.snake(list.map(e => todo => fs.unlink(`${testsDir}/${e}`, todo)));
}
test.clear = clear;
export = test;
test.test = test;
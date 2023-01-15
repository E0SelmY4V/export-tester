/**@typedef {import('./types').TestConfig} TestConfig */

const func2code = require('func2code');
const fs = require('fs');
const schema2class = require('schema2class');
/**@type {import('./types')['configSchema']} */
const configSchema = require('./config-schema.json');
const factory = schema2class(configSchema);
const scpoProce = require('scpo-proce');
const child_process = require('child_process');
const path = require('path');

/**@type {<T extends readonly string[]>(arr:[...T])=>{[I in T[number]]?:true}} */
function arr2obj(arr) {
	const obj = {};
	arr.forEach(e => obj[e] = true);
	return obj;
}

function rainbow(main, text, color) {
	if (main) console.log(`+-------------------\n| \x1b[${color}m ${text} \x1b[0m`);
	else console.log(`| ${text}`);
}

/**@type {<T extends string[]>(list:[...T],callback:Function)=>(n:T[number])=>void} */
function allFunc(list, callback) {
	const qObj = {};
	let i = 0;
	list.forEach(e => e in qObj || (qObj[e] = true, ++i));
	return (n) => (n in qObj && (--i, delete qObj[n]), i || callback());
}

function proce(...list) {
	return scpoProce.snake(list).trap((...errs) => console.error(...errs));
}

function fork(file, todo) {
	rainbow(false, '\x1b[4m\x1b[34m' + path.normalize(__dirname + file) + '\x1b[0m', 4);
	child_process.fork(__dirname + file).on('close', todo);
}

/**@type {{[type:string]:(conf:TestConfig)=>void}} */
const doObj = {
	'ts'(conf) {
		rainbow(true, 'TS', 44)
		return proce(
			todo => {
				child_process.exec('tsc -v', todo);
				rainbow(false, 'Testing cli');
			},
			(todo, ordo, err) => {
				if (err) return ordo('Have you installed "tsc" ?');
				rainbow(false, 'Compiling');
				child_process.exec('tsc' + (
					conf.configFile.ts
						? ' -p ' + conf.configFile.ts
						: ''
				) + ' ' + __dirname + '/test/test.ts', todo);
			},
			(todo, ordo, err) => {
				if (err) return ordo('Compilation failed.', err);
				fork('/test/test.js', todo);
			},
		);
	},
	'node-esm'(conf) {
		rainbow(true, 'Node ESM', 45);
		return proce(
			todo => {
				fork('/test/test.mjs', todo);
			},
		);
	},
	'node-cjs'(conf) {
		rainbow(true, 'Node CJS', 43);
		return proce(
			todo => {
				fork('/test/test.cjs', todo);
			},
		);
	},
	webpack(conf, n) {
		return proce(
			todo => {
				child_process.exec('webpack -v', todo)
				rainbow(false, 'Testing cli');
			},
			(todo, ordo, err) => {
				if (err) return ordo('Have you installed "webpack" ?', err);
				rainbow(false, 'Copying configs');
				if (conf.configFile.webpack) fs.cp(conf.configFile.webpack, __dirname + '/test/webpack.config.js', todo);
				else fs.writeFile(__dirname + '/test/webpack.config.js', '', todo);
			},
			(todo, ordo, err) => {
				if (err) return ordo('Cannot copy the config JS file.', err);
				rainbow(false, 'Modifying configs');
				fs.writeFile(__dirname + '/test/webpack.config.js', `
					;
					module || (module = {});
					module.exports  || (module.exports = {});
					module.exports.output  || (module.exports.output = {});
					module.exports.output.path = __dirname;
					module.exports.output.filename = 'webpack-${n}.js';
					module.exports.mode = 'development';
				`, { flag: 'a' }, todo);
			},
			(todo, ordo, err) => {
				if (err) return ordo('Cannot modify the config JS file.', err);
				rainbow(false, 'Compiling');
				child_process.exec('webpack ' + __dirname + '/test/test.' + n + 'js -c ' + __dirname + '/test/webpack.config.js ', todo);
			},
			(todo, ordo, err) => {
				if (err) return ordo('Compilation failed.', err);
				fork('/test/webpack-' + n + '.js', todo);
			},
		);
	},
	'webpack-esm'(conf) {
		rainbow(true, 'webpack ESM', 42);
		return doObj.webpack(conf, 'm');
	},
	'webpack-cjs'(conf) {
		rainbow(true, 'webpack CJS', 46);
		return doObj.webpack(conf, 'c');
	},
};

/**@type {(n:TestConfig,tests:{[name:string]:Function})=>void} */
function test(n, tests) {
	const conf = factory(n);
	const findPath = JSON.stringify('./' + path.relative(__dirname + '/test', conf.file));
	const cjs = conf.imp.cjs || `var ${conf.sign}=require(${findPath});`;
	const esm = conf.imp.esm || `import ${conf.sign} from ${findPath};`;
	let str = '\nfunction log(...params) { console.log("| ", ...params) }\n';
	for (var i in tests)
		str += `
		console.log('|\\n+\\x1b[32m${JSON.stringify(i)}:\\x1b[0m');
		(function(){
			${func2code.getInnerCode(tests[i])}
		})();`;
	str += '\n ;console.log("|");';
	console.log(conf.req);
	const ned = arr2obj(conf.req);
	const fin = allFunc(conf.req, () => scpoProce.snake(conf.req.map(e => async todo => e in doObj ? (await doObj[e](conf), todo()) : todo())));
	('node-esm' in ned || 'webpack-esm' in ned) && fs.writeFile(__dirname + '/test/test.mjs', esm + str, () => (fin('node-esm'), fin('webpack-esm')));
	'ts' in ned && fs.writeFile(__dirname + '/test/test.ts', esm + str, () => fin('ts'));
	('node-cjs' in ned || 'webpack-cjs' in ned) && fs.writeFile(__dirname + '/test/test.cjs', cjs + str, () => (fin('node-cjs'), fin('webpack-cjs')));
}
exports.test = test;
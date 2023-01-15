/**@typedef {import('./types').TestConfig} TestConfig */

const func2code = require('func2code');
const fs = require('fs');
const schema2class = require('schema2class');
/**@type {import('./types')['configSchema']} */
const configSchema = require('./config-schema.json');
const factory = schema2class(configSchema);
const scpoProce = require('scpo-proce');
const child_process = require('child_process');

/**@type {<T extends readonly string[]>(arr:[...T])=>{[I in T[number]]?:true}} */
function arr2obj(arr) {
	const obj = {};
	arr.forEach(e => obj[e] = true);
	return obj;
}

/**@type {<T extends string[]>(list:[...T],callback:Function)=>(n:T[number])=>void} */
function allFunc(list, callback) {
	const qObj = {};
	let i = 0;
	list.forEach(e => e in qObj || (qObj[e] = true, ++i));
	return (n) => n in qObj && (--i, delete qObj[n]), i || callback();
}
/**@type {{[type:string]:(conf:TestConfig)=>void}} */
const doObj = {
	'ts'(conf) {
	},
	async 'node-esm'(conf) {

	},
	async 'node-cjs'(conf) {

	},
	async 'webpack-esm'(conf) {

	},
	async 'webpack-cjs'(conf) {

	},
};

function test(n, tests) {
	const conf = factory(n);
	const cjs = conf.imp.cjs || `var ${conf.sign}=require(${JSON.stringify(conf.file)});`;
	const esm = conf.imp.esm || `import ${conf.sign} from ${JSON.stringify(conf.file)};`;
	let str = '\n\n';
	for (var i in tests)
		str += `
		console.log('------ Test ${i} ------');
		!function(){
			${func2code.getInnerCode(tests[i])}
		}();`;
	const ned = arr2obj(conf.req);
	const fin = allFunc(conf.req, () => scpoProce.snake(conf.req.map(e => async todo => e in doObj ? (await doObj[e](conf), todo()) : todo())));
	('node-esm' in ned || 'webpack-esm' in ned) && fs.writeFile(__dirname + '/test/test.mjs', esm + str, () => (fin('node-esm'), fin('webpack-esm')));
	'ts' in ned && fs.writeFile(__dirname + '/test/test.ts', esm + str, () => fin('ts'));
	('node-cjs' in ned || 'webpack-cjs' in ned) && fs.writeFile(__dirname + '/test/test.cjs', cjs + str, () => (fin('node-cjs'), fin('webpack-cjs')));
}
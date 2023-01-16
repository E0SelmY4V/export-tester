const fs = require('fs');
const fsp = require('fs/promises');
const scpoProce = require('scpo-proce');
const child_process = require('child_process');

function t(n) {
	return n ? (__dirname + '/' + n) : __dirname;
}
function mergeOut(list, out) {
	return scpoProce.snake(list.map(e => todo => fs.createReadStream(e).on('end', todo).pipe(out, { end: false }))).then(() => out.end());
}
let tid = -1;
async function outFS(k, out, cb) {
	const files = [], temps = [];
	let list = k.reverse();
	while (list.length) if (list.pop()) {
		let fname;
		try {
			while (true) await fsp.access(fname = `${__dirname}/temp${++tid}`, fs.constants, F_OK);
		} catch {
			await fsp.writeFile(fname, list.pop());
			files.push(fname), temps.push(fname);
		}
	} else files.push(t(list.pop()));
	typeof out === 'string' && (out = fs.createWriteStream(t(out)));
	await mergeOut(files, out);
	await scpoProce.snake(temps.map(e => todo => fs.unlink(e, todo)));
	return cb();
}
function merDarr(b, del = false) {
	const r = [], arr = b.slice();
	arr.forEach((e, i) => (r.push(del ? e : { a: e, b: arr[i + 1] }), delete arr[i + 1]));
	return r;
}
function cps(p) {
	return scpoProce.snake(merDarr(p).map(e => todo => (fs.cp(t(e.a), t(e.b), todo))));
}
function dels(p) {
	return scpoProce.snake(p.map(e => todo => fs.unlink(t(e), todo)));
}

const tsList = [
	'../index.js', 'index.js',
	'../types.js', 'types.js',
];
scpoProce.snake(
	todo => outFS([
		0, 'types.ts',
		1, ' = ',
		0, '../config-schema.json',
		1, ' as const',
	], '../types.ts', todo),
	todo => child_process.exec('tsc', todo),
	(todo, ordo, err, stdout, stderr) => (console.log(stdout), err ? (console.log(stderr), ordo) : todo)(err),
	todo => cps(tsList).then(todo),
	todo => dels(merDarr(tsList, true)).then(todo),
	todo => child_process.exec('webpack', todo),
	(todo, ordo, err, stdout, stderr) => (err ? (console.log(stdout, stderr), ordo) : todo)(err),
	todo => outFS([
		1, '((exp)=>{',
		0, '../index.js',
		1, '})(module)',
	], 'temp.js', todo),
	todo => cps(['temp.js', '../index.js']).then(todo),
	todo => dels([...merDarr(tsList.slice(1), true), 'temp.js']).then(todo),
).then(() => console.log('finish.'));
const fs = require('fs');
const fsp = require('fs/promises');
const scpoProce = require('scpo-proce');
const child_process = require('child_process');
const { outFS, cps, dels } = require('lethal-build')(__dirname);

const tsList = [
	'../index.js', 'index.js',
	'../types.js', 'types.js',
];
scpoProce.snake(
	todo => outFS([
		[0, 'types.ts'],
		[1, ' = '],
		[0, '../config-schema.json'],
		[1, ' as const'],
	], '../types.ts').then(todo),
	todo => process.argv[2] !== 'dev' && todo(),
	todo => child_process.exec('tsc', todo),
	(todo, ordo, err, stdout, stderr) => (console.log(stdout), err ? (console.log(stderr), ordo) : todo)(err),
	// todo => cps(tsList).then(todo),
	// todo => dels(merDarr(tsList, true)).then(todo),
	// todo => child_process.exec('webpack', todo),
	// (todo, ordo, err, stdout, stderr) => (err ? (console.log(stdout, stderr), ordo) : todo)(err),
	// todo => outFS([
	// 	1, '((exp)=>{',
	// 	0, '../index.js',
	// 	1, '})(module)',
	// ], 'temp.js', todo),
	// todo => cps(['temp.js', '../index.js']).then(todo),
	// todo => dels([...merDarr(tsList.slice(1), true), 'temp.js']).then(todo),
).then(() => console.log('finish.'));
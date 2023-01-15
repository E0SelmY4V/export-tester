const schema = require('./config-schema.json');
const fs = require('fs');
const out = fs.createWriteStream(__dirname + '/types.d.ts');
const pracFn = require('prac-fn');
const { write, deleteAll } = pracFn.file;
const scpoProce = require('scpo-proce');

function merge(list, cb) {
	list.length
		? fs.createReadStream(list.pop()).on('end', () => merge(list, cb)).pipe(out, { end: false })
		: (out.end(), cb());
}
scpoProce(write(__dirname + '/temp0', ':' + JSON.stringify(schema)))
	.grab(td => merge(['temp0', 'ori.ts'].map(e => __dirname + '/' + e), td))
	.then(() => deleteAll(__dirname + '/temp0'))
	.take(() => console.log('finish.'));

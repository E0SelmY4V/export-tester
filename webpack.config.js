module.exports = {
	entry: __dirname + '/lib/build/index.js',
	mode: 'production',
	output: {
		path: __dirname + '/lib',
		filename: 'index.js',
	},
	target: 'node',
}
const { outFS, exec, snake, judge } = require('lethal-build')(__dirname);

snake(
	outFS([
		[0, 'types.ts'],
		[1, ' = '],
		[0, '../config-schema.json'],
		[1, ' as const'],
	], '../types.ts'),
	judge(process.argv[2] !== 'dev'),
	exec('tsc'),
).then(() => console.log('finish.'));
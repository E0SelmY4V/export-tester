const {
	outFS,
	exec,
	snake,
	judge,
	log,
	time,
	timeEnd,
} = require('lethal-build')(__dirname);

snake(
	outFS([
		[1, `
import type { OfSchema } from 'accurtype';
export type InConfig = OfSchema<typeof configSchema>;
export const configSchema = `
		],
		[0, 'lib/config-schema.json'],
		[1, ' as const'],
	], 'lib/types.ts'),
	judge(process.argv[2] !== 'dev'),
	exec('npx tsc'),
	timeEnd(),
	log('Built in', time(), 'ms'),
	async () => process.exit(0),
);

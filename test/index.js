require('..')(
	{
		pack: 'schema2class',
		sign: 's2c',
		cfg: {
			ts: {
				cjsMod: true,
			},
		},
		req: ['node-cjs', 'asd'],
		disp: true,
	},
	{
		imp() {
			console.log(s2c);
		},
		err() {
			// throw Error('ssd');
		},
	},
).then(e => console.log(e));
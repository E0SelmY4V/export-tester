require('..')(
	{
		pack: 'schema2class',
		sign: 's2c',
		cfg: {
			ts: {
				cjsMod: true,
			},
		},
	},
	{
		imp() {
			console.log(s2c);
		},
	},
);
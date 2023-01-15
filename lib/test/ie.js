/// <reference path="../build/global.d.ts" />
const path = require('path');
require('ie-passer').iePasser(
	[
		path.join(__dirname, '../build/main.js')
	],
	{
		0() {
			var arr = ChangeRF.ctf(40, 20, { round: true });
			alert(arr);
		},
	},
	{
		version: 5,
	},
);
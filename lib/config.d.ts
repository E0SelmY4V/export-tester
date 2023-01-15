interface Tester {
	units?: (() => void)[];
	command?: string;
}
interface ExportTesterConfig {
	option?: {};
	tester?: {
		[I in
		| 'webpack'
		| 'commonjs'
		| 'esmodule'
		| 'browser'
		]?: Tester;
	}
}

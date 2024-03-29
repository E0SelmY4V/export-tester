# Export Tester

![Export Tester](lib/logo/logo256.png)

This tool can test if your code can be import well in defferent environment.

Environments supported:

- `ts` Typescript
- `node-cjs` CommonJS running in Node
- `node-esm` ES Module running in Node
- `webpack-cjs` CommonJS bundled by webpack
- `webpack-esm` ES Module bundled by webpack

This test tool had been tested by the tests of this test tool.

## Install

```bash
npm i export-tester
```

## Import

### CommonJS

```js
const tester = require('export-tester');
```

### Typescript

```js
import tester = require('export-tester');
```

### ES Module

```js
import tester from 'export-tester';
```

## Usage

```js
/// <reference path="export-tester/lib/tool.d.ts" />

/// <reference path="some-mod/declaration.d.ts" />
// (If the module tested provide.)

require('export-tester')(
  {
    sign: 'someMod', // The identifier of module imported.
    file: `${__dirname}/lib/index.js`, // Entry file.
    req: ['ts', 'node-esm'], // Test environments.
  },
  {
    logMod() { log(someMod); },
    checkDef() { log(someMod.default); },
    // ...
  },
).then(({ err, detail }) => {
  if (err) console.error(detail);
  process.exit(err);
});
```

Output:

```text
+-------------------
|  Node ESM
| D:\...\export-tester\lib\test\node.mjs
|
+-"logMod":
| ...
|
+-"checkDef":
| ...
|
+-------------------
|  TS
| Testing cli
| Compiling
| D:\...\export-tester\lib\test\test.js
| D:\...\export-tester\lib\test\test.ts
|
+-"logMod":
| ...
|
+-"checkDef":
| ...
|
```

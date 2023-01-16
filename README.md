# Export Tester

![Export Tester](lib/logo/logo256.png)

This tool can test if your code can be import in ES Module, Common JS or Browser.

## Import

### CommonJS

```js
const tester = require('export-tester');
```

### ES Module

```js
import tester = require('export-tester');
```

## Usage

```js
/// <reference path="export-tester/lib/tool.d.ts" />

/// <reference path="some-mod/declaration.d.ts" />
// (If the module tested provide.)

require('export-tester')(
  {
    sign: 'someMod', // The identifier of module imported.
    file: __dirname + '/../some-mod/index.js', // Module file.
    req: ['node-esm', 'ts'], // Test environments.
  },
  {
    logMod() { log(someMod); },
    checkDef() { log(someMod.default); },
    // ...
  }
);
```

Output:

```text
+-------------------
|  Node ESM
| D:\...\export-tester\lib\test\test.mjs
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

You can check the result of these tests running in defferent environment clearly.

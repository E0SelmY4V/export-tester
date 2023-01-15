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

/// <reference path="someMod/declaration.d.ts" />
// (If the module tested provide.)

require('export-tester')(
  {
    sign: 'someMod', // The identifier of module imported.
    file: __dirname + '/../someMod/index.js', // Module file.
  },
  {
    test0() { log(mod); },
    test1() { log(mod.default); },
    // ...
  }
);
```

Output:

```text
+-------------------
|  TS
| Testing cli
| Compiling
| D:\...\export-tester\lib\test\test.js
| D:\...\export-tester\lib\test\test.ts
|
+"test0":
| ...
|
+"test1":
| ...
|
+-------------------
|  Node ESM
| D:\...\export-tester\lib\test\test.mjs
|
+"test0":
| ...
|
+"test1":
| ...
|

...
```

You can check the result of these tests running in defferent environment clearly.

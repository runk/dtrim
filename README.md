# dtrim

A tool for trimming deep/lenghty javascript structures. Some potential usages are: debugging, logging or data sanitization.

#### Installation

```shell
npm i dtrim
```

#### Usage

```javascript
const dtrim = require('dtrim');

const trim = dtrim.trimmer({ depth: 4 });
const nasty = { ... a big, deep and nasty object here ... };
const nice = trim(nasty);
```


#### Options

_dtrim.trimmer([options])_

- `options`: `<Object>`
  - `depth`: `<number>` Trim depth - all structures deeper than this will be omitted from output. This is useful for truncating large complicated objects. To make it return full structure, pass `Infinity` or some arbitrary large number. *Default*: `4`.
  - `size`: `<number>` Trim size - all objects and arrays that are longer/bigger than this size will be trimmed. Note on trimming objects: because order of properties is not guaranteed by spec, objects with number of properties bigger than *size* will be represented as string `"Object(N)"`. To make it return full structure, pass `Infinity` or some arbitrary large number. *Default*: `64`.
  - `string`: `<number>` Trim strings that are longer than specified number. To make it return full structure, pass `Infinity` or some arbitrary large number. *Default*: `512`.
  - `buffer`: `<boolean>` Substitues instancs of a `Buffer` object with their string representation: `"Buffer(N)"`. *Default*: `true`.

- Returns: `<Function>` - trimmer function that accepts input argument of any type.


#### License

MIT

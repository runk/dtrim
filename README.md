# dtrim

_dtrim_ is a tool for trimming deep/lengthy javascript structures. Some potential usages are: debugging, logging or data sanitization. Fully configurable. 

Caters for:

- Big arrays
- Objects with lots of keys
- Nested, deep structures
- Objects with circular references
- Long strings
- Buffers
- Functions

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
  - `size`: `<number>` Trim size - all objects and arrays that are longer/bigger than specified size will be trimmed. Note on trimming objects: because order of properties is not guaranteed by javascript spec, objects with number of properties bigger than *size* will be represented as string `"Object(N)"`. To make it return full structure, pass `Infinity` or some arbitrary large number. *Default*: `64`.
  - `string`: `<number>` Trim strings that are longer than specified number. To make it return full structure, pass `Infinity` or some arbitrary large number. *Default*: `512`.
  - `buffer`: `<boolean>` Substitues instances of a `Buffer` object with their string representation: `"Buffer(N)"`. *Default*: `true`.

- Returns: `<Function>` - trimmer function that accepts input argument of any type.


#### License

MIT

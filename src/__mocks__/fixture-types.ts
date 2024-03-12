const map = new Map();
map.set('foo', 'bar');

const set = new Set();
set.add('foo');

export default {
  buffer: Buffer.from('abc'),
  array: ['foo', 'bar'],
  object: { foo: 'bar' },
  string: 'foo bar',
  fn: () => 1 + 1,
  foo: null,
  bar: undefined,
  baz: false,
  bao: NaN,
  gao: 123,
  shao: 123.321,
  big: BigInt(123),
  sym: Symbol('dummy'),
  map,
  set,
  date: new Date('2024-03-12T05:29:06.048Z'),
};

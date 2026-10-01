import _ from 'lodash';
import { trimmer as trimmerFactory } from './index.ts';
import { expect, test } from 'vitest';

import fixtureLarge from './__mocks__/fixture-large.ts';
import fixtureRealWorld from './__mocks__/fixture-real-world.ts';
import fixtureTypes from './__mocks__/fixture-types.ts';

const defaultTrimmer = trimmerFactory({
  depth: 3,
  string: 32,
  size: 16,
});

test('large data sets', () =>
  expect(defaultTrimmer(fixtureLarge)).toMatchSnapshot());

test('real world example', () =>
  expect(defaultTrimmer(fixtureRealWorld)).toMatchSnapshot());

test('misc types', () =>
  expect(defaultTrimmer(fixtureTypes)).toMatchSnapshot());

test('circular structures', () => {
  const refA = { foo: 'bar' };
  const refB = { refA, something: 'else' };
  // @ts-ignore
  refA.backref = refB;
  expect(defaultTrimmer(refA)).toMatchSnapshot();
});

test('immutability', () => {
  const input = { list: _.range(0, 1024) };
  const trimmed = defaultTrimmer(input);
  expect(input.list.length).toBe(1024);
  expect(trimmed.list).toBe('Array(1024)');
});

test('different data types', () => {
  expect(defaultTrimmer(false)).toBe(false);
  expect(defaultTrimmer(true)).toBe(true);
  expect(defaultTrimmer('hi')).toBe('hi');
  expect(defaultTrimmer(123)).toBe(123);
  expect(defaultTrimmer(null)).toBe(null);
  expect(defaultTrimmer(undefined)).toBe(undefined);
  expect(defaultTrimmer('')).toBe('');
  expect(defaultTrimmer([])).toEqual([]);
  expect(defaultTrimmer(/test/)).toEqual({});
});

test('errors: basic', () => {
  const output = defaultTrimmer(new Error('Very bad'));
  expect(output.message).toBe('Very bad');
  expect(output.name).toBe('Error');
  expect(output.stack).toMatch(/^Error: Very bad\n\s+at.{50,}/);
});

test('errors: customized', () => {
  const error = new Error('Very bad');
  // @ts-ignore
  error.extra = { foo: 'bar' };
  const output = defaultTrimmer(error);
  expect(output.message).toBe('Very bad');
  expect(output.extra).toEqual({ foo: 'bar' });
});

test('rule: #string', () => {
  const input = { short: 'hi', long: _.repeat('a', 1024) };
  expect(trimmerFactory({ string: 4 })(input)).toEqual({
    short: 'hi',
    long: 'aaaa...',
  });
});

test('rule: #buffer', () => {
  const input = { buf: Buffer.alloc(8) };
  expect(trimmerFactory({ buffer: true })(input)).toEqual({
    buf: 'Buffer(8)',
  });
  expect(trimmerFactory({ buffer: false })(input)).toEqual({
    buf: 'AAAAAAAAAAA=',
  });
});

test('rule: #depth', () => {
  const input = {
    deep: _.set({}, 'a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.r', 'very deep'),
    shallow: _.set({}, 'a.b', 'quite shallow'),
  };
  expect(trimmerFactory({ depth: 3 })(input)).toEqual({
    deep: {
      a: { b: '[Object]' },
    },
    shallow: {
      a: { b: 'quite shallow' },
    },
  });
});

test('rule: #size', () => {
  const bigList = _.range(0, 16);
  const smallList = _.range(0, 2);
  const input = {
    bigList,
    bigObject: _.zipObject(bigList, bigList),
    smallList,
    smallObject: _.zipObject(smallList, smallList),
  };

  const output = trimmerFactory({ size: 5 })(input);
  expect(output).toEqual({
    bigList: 'Array(16)',
    bigObject: 'Object(16)',
    smallList: [0, 1],
    smallObject: { 0: 0, 1: 1 },
  });
});

test('rule: #getters', () => {
  class Foo {
    get foo() {
      return 'foo';
    }
    set bar(_arg: any) {}
    public baz() {
      return 'baz';
    }
  }
  const object = {
    get getter() {
      return 'getter';
    },
  };
  const foo = new Foo();
  const symbol = Symbol('some desc');
  const map = new Map();
  const set = new Set('a');
  const input = {
    foo,
    object,
    symbol,
    map,
    set,
  };

  expect(trimmerFactory({ getters: false })(input)).toEqual({
    foo: {
      foo: 'foo',
    },
    object: {
      getter: 'getter',
    },
    symbol: {
      description: 'some desc',
    },
    map: {
      size: 0,
    },
    set: {
      size: 1,
    },
  });

  expect(trimmerFactory({ getters: true })(input)).toEqual({
    foo: {},
    object: {
      getter: '[Getter]',
    },
    symbol: {},
    map: {},
    set: {},
  });
});

test('rule: #ignore', () => {
  class Foo {
    get foo() {
      return 'foo';
    }
    set bar(_arg: any) {}
    public baz() {
      return 'baz';
    }
  }
  const foo = new Foo();
  const input = {
    a: foo,
    b: foo,
    c: foo,
  };

  const output = trimmerFactory({
    retain: new Set(['a', 'c']),
  })(input);

  expect(output).toEqual({
    a: foo,
    b: {},
    c: foo,
  });
});

test('rule: #functions', () => {
  const input = {
    regularProp: 'value',
    fn: () => 'function',
    anotherProp: 42,
    anotherFn: function namedFunction() {
      return 'named';
    },
    nested: {
      innerFn: () => 'inner',
      innerProp: 'inner value',
    },
  };

  const defaultOutput = trimmerFactory()(input);
  expect(defaultOutput).toEqual({
    regularProp: 'value',
    fn: '[Function]',
    anotherProp: 42,
    anotherFn: '[Function]',
    nested: {
      innerFn: '[Function]',
      innerProp: 'inner value',
    },
  });

  const removeFunctionsOutput = trimmerFactory({ functions: false })(input);
  expect(removeFunctionsOutput).toEqual({
    regularProp: 'value',
    anotherProp: 42,
    nested: {
      innerProp: 'inner value',
    },
  });

  const fn = () => {};
  const functionOnly = trimmerFactory()(fn);
  expect(functionOnly).toBe('[Function]');

  const functionRemoved = trimmerFactory({ functions: false })(fn);
  expect(functionRemoved).toBe(undefined);
});

test('handles enumerable prototype getters that are not own properties', () => {
  const privateField = new WeakMap();

  class URLSearchParamsLike {
    constructor() {
      privateField.set(this, []);
    }
  }

  Object.defineProperty(URLSearchParamsLike.prototype, 'size', {
    get() {
      if (!privateField.has(this)) {
        const err: any = new TypeError(
          'Value of "this" must be of type URLSearchParams'
        );
        err.code = 'ERR_INVALID_THIS';
        throw err;
      }
      return privateField.get(this)!.length;
    },
    enumerable: true,
  });

  const target = new URLSearchParamsLike();

  const proxy = new Proxy(target, {
    get(target, prop, receiver) {
      return Reflect.get(target, prop, receiver);
    },
  });

  expect(() => (proxy as any).size).toThrow(
    /Value of "this" must be of type URLSearchParams/
  );

  expect(() => {
    const result = defaultTrimmer(proxy);
    expect(typeof result).toBe('object');
  }).not.toThrow();
});

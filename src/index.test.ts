import _ from 'lodash';
import { trimmer as trimmerFactory } from '.';
import test from 'ava';

import fixtureLarge from './__mocks__/fixture-large';
import fixtureRealWorld from './__mocks__/fixture-real-world';
import fixtureTypes from './__mocks__/fixture-types';

const defaultTrimmer = trimmerFactory({
  depth: 3,
  string: 32,
  size: 16,
});

test('large data sets', (t) => t.snapshot(defaultTrimmer(fixtureLarge)));

test('real world example', (t) => t.snapshot(defaultTrimmer(fixtureRealWorld)));

test('misc types', (t) => t.snapshot(defaultTrimmer(fixtureTypes)));

test('circular structures', (t) => {
  const refA = { foo: 'bar' };
  const refB = { refA, something: 'else' };
  // @ts-ignore
  refA.backref = refB;
  t.snapshot(defaultTrimmer(refA));
});

test('immutability', (t) => {
  const input = { list: _.range(0, 1024) };
  const trimmed = defaultTrimmer(input);
  t.is(input.list.length, 1024);
  t.is(trimmed.list, 'Array(1024)');
});

test('different data types', (t) => {
  t.is(defaultTrimmer(false), false);
  t.is(defaultTrimmer(true), true);
  t.is(defaultTrimmer('hi'), 'hi');
  t.is(defaultTrimmer(123), 123);
  t.is(defaultTrimmer(null), null);
  t.is(defaultTrimmer(undefined), undefined);
  t.is(defaultTrimmer(''), '');
  t.deepEqual(defaultTrimmer([]), []);
  t.deepEqual(defaultTrimmer(/test/), {});
});

test('errors: basic', (t) => {
  const output = defaultTrimmer(new Error('Very bad'));
  t.is(output.message, 'Very bad');
  t.is(output.name, 'Error');
  t.regex(output.stack, /^Error: Very bad\n\s+at.{50,}/);
});

test('errors: customized', (t) => {
  const error = new Error('Very bad');
  // @ts-ignore
  error.extra = { foo: 'bar' };
  const output = defaultTrimmer(error);
  t.is(output.message, 'Very bad');
  t.deepEqual(output.extra, { foo: 'bar' });
});

test('rule: #string', (t) => {
  const input = { short: 'hi', long: _.repeat('a', 1024) };
  t.deepEqual(trimmerFactory({ string: 4 })(input), {
    short: 'hi',
    long: 'aaaa...',
  });
});

test('rule: #buffer', (t) => {
  const input = { buf: Buffer.alloc(8) };
  t.deepEqual(trimmerFactory({ buffer: true })(input), {
    buf: 'Buffer(8)',
  });
  t.deepEqual(trimmerFactory({ buffer: false })(input), {
    buf: 'AAAAAAAAAAA=',
  });
});

test('rule: #depth', (t) => {
  const input = {
    deep: _.set({}, 'a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.r', 'very deep'),
    shallow: _.set({}, 'a.b', 'quite shallow'),
  };
  t.deepEqual(trimmerFactory({ depth: 3 })(input), {
    deep: {
      a: { b: '[Object]' },
    },
    shallow: {
      a: { b: 'quite shallow' },
    },
  });
});

test('rule: #size', (t) => {
  const bigList = _.range(0, 16);
  const smallList = _.range(0, 2);
  const input = {
    bigList,
    bigObject: _.zipObject(bigList, bigList),
    smallList,
    smallObject: _.zipObject(smallList, smallList),
  };

  const output = trimmerFactory({ size: 5 })(input);
  t.deepEqual(output, {
    bigList: 'Array(16)',
    bigObject: 'Object(16)',
    smallList: [0, 1],
    smallObject: { 0: 0, 1: 1 },
  });
});

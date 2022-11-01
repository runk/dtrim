import * as utils from './utils';
import test, { ExecutionContext } from 'ava';

(() => {
  const helper = (t: ExecutionContext, input: any, expected: string) =>
    t.deepEqual(utils.getTag(input), expected);

  test('getTag: string', (t) => helper(t, 'string', '[object String]'));
  test('getTag: null', (t) => helper(t, null, '[object Null]'));
  test('getTag: undefined', (t) => helper(t, undefined, '[object Undefined]'));
  test('getTag: function', (t) => helper(t, () => null, '[object Function]'));
  test('getTag: object', (t) => helper(t, {}, '[object Object]'));
})();

(() => {
  const helper = (t: ExecutionContext, input: any, expected: number) =>
    t.deepEqual(utils.getSize(input), expected);

  test('getSize: string', (t) => helper(t, 'string', 6));
  test('getSize: null', (t) => helper(t, null, 0));
  test('getSize: undefined', (t) => helper(t, undefined, 0));
  test('getSize: boolean', (t) => helper(t, false, 0));
  test('getSize: array', (t) => helper(t, [1, 2, 3], 3));
  test('getSize: object', (t) => helper(t, { a: 1, b: 2 }, 2));
  test('getSize: map', (t) => helper(t, new Map(), 0));
  test('getSize: set', (t) => helper(t, new Set(), 0));
})();

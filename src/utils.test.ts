import * as utils from './utils.ts';
import { expect, test } from 'vitest';

(() => {
  const helper = (input: any, expected: string) =>
    expect(utils.getTag(input)).toEqual(expected);

  test('getTag: string', () => helper('string', '[object String]'));
  test('getTag: null', () => helper(null, '[object Null]'));
  test('getTag: undefined', () => helper(undefined, '[object Undefined]'));
  test('getTag: function', () => helper(() => null, '[object Function]'));
  test('getTag: object', () => helper({}, '[object Object]'));
})();

(() => {
  const helper = (input: any, expected: number) =>
    expect(utils.getSize(input)).toEqual(expected);

  test('getSize: string', () => helper('string', 6));
  test('getSize: null', () => helper(null, 0));
  test('getSize: undefined', () => helper(undefined, 0));
  test('getSize: boolean', () => helper(false, 0));
  test('getSize: array', () => helper([1, 2, 3], 3));
  test('getSize: object', () => helper({ a: 1, b: 2 }, 2));
  test('getSize: map', () => helper(new Map(), 0));
  test('getSize: set', () => helper(new Set(), 0));
})();

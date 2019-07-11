import * as utils from "./utils";

describe("utils", () => {
  describe("getTag", () => {
    const helper = (input: any, expected: string) =>
      expect(utils.getTag(input)).toBe(expected);
    test("string", () => helper("string", "[object String]"));
    test("null", () => helper(null, "[object Null]"));
    test("undefined", () => helper(undefined, "[object Undefined]"));
    test("function", () => helper(() => null, "[object Function]"));
    test("object", () => helper({}, "[object Object]"));
  });

  describe("getSize", () => {
    const helper = (input: any, expected: number) =>
      expect(utils.getSize(input)).toBe(expected);
    test("string", () => helper("string", 6));
    test("null", () => helper(null, 0));
    test("undefined", () => helper(undefined, 0));
    test("boolean", () => helper(false, 0));
    test("array", () => helper([1, 2, 3], 3));
    test("object", () => helper({ a: 1, b: 2 }, 2));
    test("map", () => helper(new Map(), 0));
    test("set", () => helper(new Set(), 0));
  });
});

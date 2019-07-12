import _ from "lodash";
import { trimmer as trimmerFactory } from ".";

import fixtureLarge from "./__mocks__/fixture-large";
import fixtureRealWorld from "./__mocks__/fixture-real-world";
import fixtureTypes from "./__mocks__/fixture-types";

describe("trimmer", () => {
  const defaultTrimmer = trimmerFactory({
    depth: 3,
    string: 32,
    size: 16
  });

  test("large data sets", () =>
    expect(defaultTrimmer(fixtureLarge)).toMatchSnapshot());

  test("real world example", () =>
    expect(defaultTrimmer(fixtureRealWorld)).toMatchSnapshot());

  test("misc types", () =>
    expect(defaultTrimmer(fixtureTypes)).toMatchSnapshot());

  test("circular structures", () => {
    const refA = { foo: "bar" };
    const refB = { refA, something: "else" };
    // @ts-ignore
    refA.backref = refB;
    expect(defaultTrimmer(refA)).toMatchSnapshot();
  });

  test("immutability", () => {
    const input = { list: _.range(0, 1024) };
    const trimmed = defaultTrimmer(input);
    expect(input.list).toHaveLength(1024);
    expect(trimmed.list).toBe("Array(1024)");
  });

  test("different data types", () => {
    expect(defaultTrimmer(false)).toBe(false);
    expect(defaultTrimmer(true)).toBe(true);
    expect(defaultTrimmer("hi")).toBe("hi");
    expect(defaultTrimmer(123)).toBe(123);
    expect(defaultTrimmer(null)).toBe(null);
    expect(defaultTrimmer(undefined)).toBe(undefined);
    expect(defaultTrimmer("")).toBe("");
    expect(defaultTrimmer([])).toEqual([]);
    expect(defaultTrimmer(/test/)).toEqual({});
  });

  describe("errors", () => {
    test("basic", () => {
      const output = defaultTrimmer(new Error("Very bad"));
      expect(output.message).toBe("Very bad");
      expect(output.name).toBe("Error");
      expect(output.stack).toMatch(/^Error: Very bad\n\s+at.{50,}/);
    });

    test("customized", () => {
      const error = new Error("Very bad");
      // @ts-ignore
      error.extra = { foo: "bar" };
      const output = defaultTrimmer(error);
      expect(output.message).toBe("Very bad");
      expect(output.extra).toEqual({ foo: "bar" });
    });
  });

  describe("rules", () => {
    test("#string", () => {
      const input = { short: "hi", long: _.repeat("a", 1024) };
      expect(trimmerFactory({ string: 4 })(input)).toEqual({
        short: "hi",
        long: "aaaa..."
      });
    });

    test("#buffer", () => {
      const input = { buf: Buffer.alloc(8) };
      expect(trimmerFactory({ buffer: true })(input)).toEqual({
        buf: "Buffer(8)"
      });
      expect(trimmerFactory({ buffer: false })(input)).toEqual({
        buf: "AAAAAAAAAAA="
      });
    });

    test("#depth", () => {
      const input = {
        deep: _.set({}, "a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.r", "very deep"),
        shallow: _.set({}, "a.b", "quite shallow")
      };
      expect(trimmerFactory({ depth: 3 })(input)).toEqual({
        deep: {
          a: { b: "[Object]" }
        },
        shallow: {
          a: { b: "quite shallow" }
        }
      });
    });

    test("#size", () => {
      const bigList = _.range(0, 16);
      const smallList = _.range(0, 2);
      const input = {
        bigList,
        bigObject: _.zipObject(bigList, bigList),
        smallList,
        smallObject: _.zipObject(smallList, smallList)
      };

      const output = trimmerFactory({ size: 5 })(input);
      expect(output).toEqual({
        bigList: "Array(16)",
        bigObject: "Object(16)",
        smallList: [0, 1],
        smallObject: { 0: 0, 1: 1 }
      });
    });
  });
});

import _ from "lodash";
import { trimmer as trimmerFactory } from ".";

import fixtureLarge from "./__mocks__/fixture-large";
import fixtureRealWorld from "./__mocks__/fixture-real-world";

describe("trimmer", () => {
  const trimmer = trimmerFactory({
    depth: 3,
    string: 32,
    size: 16
  });

  test("large data sets", () =>
    expect(trimmer(fixtureLarge)).toMatchSnapshot());

  test("real world example", () =>
    expect(trimmer(fixtureRealWorld)).toMatchSnapshot());

  test("circular structures", () => {
    const refA = { foo: "bar" };
    const refB = { refA, something: "else" };
    // @ts-ignore
    refA.backref = refB;
    expect(trimmer(refA)).toMatchSnapshot();
  });

  test("immutability", () => {
    const input = { list: _.range(0, 1024) };
    const trimmed = trimmer(input);
    expect(input.list).toHaveLength(1024);
    expect(trimmed.list).toHaveLength(16 + 1);
  });

  describe("rules", () => {
    test("#string", () => {
      const input = { short: "hi", long: _.repeat("a", 1024) };
      const trimmer = trimmerFactory({ string: 4 });
      expect(trimmer(input)).toEqual({
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
        buf: input.buf
      });
    });

    test("#depth", () => {
      const input = {
        deep: _.set({}, "a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.r", "very deep"),
        shallow: _.set({}, "a.b", "quite shallow")
      };
      expect(trimmerFactory({ depth: 3 })(input)).toEqual({
        deep: {
          a: { b: { c: "... deeper levels trimmed" } }
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
        bigList: [0, 1, 2, 3, 4, "... 11 more items"],
        bigObject: { data: "Object(16)" },
        smallList: [0, 1],
        smallObject: { 0: 0, 1: 1 }
      });
    });
  });
});

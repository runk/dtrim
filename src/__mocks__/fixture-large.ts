import _ from "lodash";

const range = _.range(0, 1024);

export default {
  list: range,
  buffer: Buffer.alloc(1024),
  deep: _.set({}, "a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.r", "very deep"),
  object: _.zipObject(range, range),
  string: _.repeat("a", 10000),
  fn: () => {
    return 1 + 1;
  },
  foo: null,
  bar: undefined,
  baz: false,
  bao: NaN
};

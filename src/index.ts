import _ from "lodash";

export interface TrimmerOptions {
  depth: number;
  size: number;
  string: number;
  buffer: boolean;
}

export type TrimmerOptionsInput = Partial<TrimmerOptions>;

const defaultOpts: TrimmerOptions = {
  depth: 4,
  size: 64,
  string: 512,
  buffer: true
};

const walker = (opts: TrimmerOptions, node: any, depth: number): any => {
  if (typeof node === "string") {
    return node.length > opts.string
      ? `${node.substr(0, opts.string)}...`
      : node;
  }

  if (
    typeof node === "number" ||
    typeof node === "boolean" ||
    typeof node === "undefined" ||
    node === null
  ) {
    return node;
  }

  if (typeof node === "function") {
    return "[Function]";
  }

  if (depth >= opts.depth) {
    return "[Object]";
  }

  if (Buffer.isBuffer(node)) {
    return opts.buffer
      ? `Buffer(${node.length})`
      : walker(opts, node.toString("base64"), depth + 1);
  }

  const size = _.size(node);
  if (size > opts.size) {
    if (_.isArray(node)) {
      return `Array(${size})`;
    }
    return `Object(${size})`;
  }

  const output: Record<string, any> = Array.isArray(node) ? [] : {};
  if (node instanceof Error) {
    output.message = node.message;
    output.stack = node.stack;
    output.name = node.name;
  }

  _.forEach(node, (val, key) => {
    output[key] = walker(opts, val, depth + 1);
  });

  return output;
};

export const trimmer = (userOpts?: TrimmerOptionsInput) => {
  const opts = _.defaults(userOpts, defaultOpts);

  return (input: any): any => {
    if (typeof input !== "object" || input === null) {
      return input;
    }

    return walker(opts, input, 0);
  };
};

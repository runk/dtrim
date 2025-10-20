import * as utils from './utils';

const OMIT_PROPERTY = Symbol('OMIT_PROPERTY');
const FUNCTION_STUB = '[Function]';
const GETTER_STUB = '[Getter]';
const OBJECT_STUB = '[Object]';

export interface TrimmerOptions {
  depth: number;
  size: number;
  string: number;
  buffer: boolean;
  getters: boolean;
  functions: boolean;
  retain: Set<string>;
}

export type TrimmerOptionsInput = Partial<TrimmerOptions>;

const defaultOpts: TrimmerOptions = {
  depth: 4,
  size: 64,
  string: 512,
  buffer: true,
  getters: true,
  functions: true,
  retain: new Set(),
};

const walker = (opts: TrimmerOptions, node: any, depth: number): any => {
  if (typeof node === 'string') {
    return node.length > opts.string
      ? `${node.substr(0, opts.string)}...`
      : node;
  }

  if (
    typeof node === 'number' ||
    typeof node === 'boolean' ||
    typeof node === 'undefined' ||
    node === null
  ) {
    return node;
  }

  if (typeof node === 'function') {
    return opts.functions ? FUNCTION_STUB : OMIT_PROPERTY;
  }

  if (node instanceof Date) {
    return node.toISOString();
  }

  if (depth >= opts.depth) {
    return OBJECT_STUB;
  }

  if (Buffer.isBuffer(node)) {
    return opts.buffer
      ? `Buffer(${node.length})`
      : walker(opts, node.toString('base64'), depth + 1);
  }

  const size = utils.getSize(node);
  if (size > opts.size) {
    if (Array.isArray(node)) {
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

  for (const key in node) {
    if (depth === 0 && opts.retain.has(key)) {
      output[key] = node[key];
      continue;
    }

    if (
      opts.getters === true &&
      Object.getOwnPropertyDescriptor(node, key)?.get
    ) {
      output[key] = GETTER_STUB;
      continue;
    }

    const result = walker(opts, node[key], depth + 1);
    if (result !== OMIT_PROPERTY) {
      output[key] = result;
    }
  }

  if (opts.getters === false) {
    const prototype = Object.getPrototypeOf(node);
    if (prototype) {
      const methods = Object.getOwnPropertyDescriptors(prototype);
      for (const key in methods) {
        if (methods[key].get) {
          const result = walker(opts, node[key], depth + 1);
          if (result !== OMIT_PROPERTY) {
            output[key] = result;
          }
        }
      }
    }
  }

  return output;
};

export const trimmer = (userOpts?: TrimmerOptionsInput) => {
  const opts = { ...defaultOpts, ...userOpts };
  return (input: any): any => {
    if (typeof input !== 'object' || input === null) {
      if (typeof input === 'function') {
        return opts.functions ? FUNCTION_STUB : undefined;
      }

      return input;
    }

    const result = walker(opts, input, 0);
    return result === OMIT_PROPERTY ? undefined : result;
  };
};

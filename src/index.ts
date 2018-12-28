import _ from "lodash";
import traverse from "traverse";

interface TrimmerOptions {
  depth: number;
  size: number;
  string: number;
  buffer: boolean;
}
type TrimmerOptionsInput = Partial<TrimmerOptions>;

const defaultOpts: TrimmerOptions = {
  depth: 4,
  size: 64,
  string: 512,
  buffer: true
};

/**
 * TODO
 */
export const trimmer = (userOpts?: TrimmerOptionsInput) => (
  input: any
): any => {
  const opts = _.defaults(userOpts, defaultOpts);

  const data = _.cloneDeep(input);
  traverse(data).forEach(function context() {
    if (this.isLeaf) {
      if (_.isString(this.node) && _.size(this.node) > opts.string) {
        this.update(`${this.node.substr(0, opts.string)}...`, true);
      }

      return;
    }

    if (
      (_.isArray(this.node) || _.isObject(this.node)) &&
      _.size(this.node) > opts.size
    ) {
      if (_.isArray(this.node)) {
        this.update(
          _.concat(
            _.slice(this.node, 0, opts.size),
            `... ${this.node.length - opts.size} more items`
          )
        );
      } else {
        this.update({ data: `Object(${_.size(this.node)})` });
      }
    }

    if (opts.buffer && _.isBuffer(this.node)) {
      this.update(`Buffer(${this.node.length})`, true);
    }

    if (this.level > opts.depth) {
      this.update("... deeper levels trimmed", true);
    }
  });
  return data;
};

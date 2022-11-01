const toString = Object.prototype.toString;

const mapTag = '[object Map]';
const setTag = '[object Set]';

export const getTag = (value: unknown): string => {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  return toString.call(value);
};

export const getSize = (collection: any): number => {
  if (collection == null) {
    return 0;
  }

  if (Array.isArray(collection)) {
    return collection.length;
  }

  const tag = getTag(collection);
  if (tag === mapTag || tag === setTag) {
    return collection.size;
  }

  return Object.keys(collection).length;
};

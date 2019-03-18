/* eslint-disable no-param-reassign */

export function isType(obj: any, type?: string) : string | boolean {
  if (type) {
    return Object.prototype.toString.call(obj) === `[object ${type}]`;
  } else {
    return Object.prototype.toString.call(obj).split(' ')[1].split(']')[0];
  }
}

export function assign(a: any, b: any) : object {
  if (isType(a, 'Object') && isType(b, 'Object')) {
    Object.keys(b).map((key) => {
      if ((isType(a[key]) !== isType(b[key])) || !isType(a[key], 'Object')) {
        a[key] = b[key];
      } else {
        a[key] = assign(a[key], b[key]);
      }
      return key;
    });
  }
  return a;
}

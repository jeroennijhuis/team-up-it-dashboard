import { TAny } from './types';

export class ArrayUtil {
  static equals(x: TAny[] | undefined, y: TAny[] | undefined): boolean {
    x ??= [];
    y ??= [];

    const ySorted = y.slice().sort();
    return (
      x.length === y.length &&
      x
        .slice()
        .sort()
        .every((value, index) => {
          return value === ySorted[index];
        })
    );
  }
}

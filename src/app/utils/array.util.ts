import { ObjectUtil } from './object.util';
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

  static groupBy<K, V>(array: V[], grouper: (item: V) => K) {
    return array.reduce((store, item) => {
      const key = grouper(item);
      if (!store.has(key)) {
        store.set(key, [item]);
      } else {
        ObjectUtil.mustBeDefined(store.get(key)).push(item);
      }
      return store;
    }, new Map<K, V[]>());
  }
}

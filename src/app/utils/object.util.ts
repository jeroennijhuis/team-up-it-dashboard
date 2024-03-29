import { TNullable } from './types';

export class ObjectUtil {
  static isDefined<T>(obj: TNullable<T>): obj is T {
    return obj !== undefined && obj !== null;
  }

  static isUndefined<T>(obj: TNullable<T>): obj is T {
    return !this.isDefined<T>(obj);
  }

  static mustBeDefined<T>(obj: TNullable<T>): T {
    if (this.isUndefined<T>(obj)) {
      throw new Error('Object may not be null!');
    }

    return obj as T;
  }
}

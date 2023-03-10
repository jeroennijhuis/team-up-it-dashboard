import { TAny } from './types';

export class CategoryUtil {
  static isChapter(category: string): boolean {
    return category.startsWith('Chapter ');
  }

  static isTribe(category: string): boolean {
    return category.startsWith('Tribe ');
  }
}

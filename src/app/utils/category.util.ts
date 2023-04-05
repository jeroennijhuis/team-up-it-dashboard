export class CategoryUtil {
  private static readonly chapterPrefix = 'Chapter ';
  private static readonly tribePrefix = 'Tribe ';

  static isChapter(category: string): boolean {
    return category.startsWith(this.chapterPrefix);
  }

  static isTribe(category: string): boolean {
    return category.startsWith(this.tribePrefix);
  }

  static getLabel(category: string): string {
    if (this.isChapter(category)) {
      return category.slice(this.chapterPrefix.length, category.length);
    } else if (this.isTribe(category)) {
      return category.slice(this.tribePrefix.length, category.length);
    }

    return category;
  }
}

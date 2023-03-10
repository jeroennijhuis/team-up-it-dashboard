import { Component, Inject, InjectionToken } from '@angular/core';
import { take } from 'rxjs';
import { TeamUpItService } from 'src/app/services/team-up-it/team-up-it.service';
import { CategoryUtil } from 'src/app/utils/category.util';

@Component({
  selector: 'app-category-select-dialog',
  templateUrl: './category-select-dialog.component.html',
  styleUrls: ['./category-select-dialog.component.scss'],
})
export class CategorySelectDialogComponent {
  static CURRENT_CATEGORIES = new InjectionToken<string[] | undefined>('CURRENT_CATEGORIES');

  generalCategories = new Map<string, boolean>();
  chapterCategories = new Map<string, boolean>();
  tribeCategories = new Map<string, boolean>();

  constructor(
    @Inject(CategorySelectDialogComponent.CURRENT_CATEGORIES)
    public currentCategories: string[] | undefined,
    service: TeamUpItService
  ) {
    service
      .getCategories()
      .pipe(take(1))
      .subscribe(categories => {
        categories.forEach(category => {
          if (CategoryUtil.isChapter(category)) {
            this.chapterCategories.set(category, currentCategories?.includes(category) ?? true);
          } else if (CategoryUtil.isTribe(category)) {
            this.tribeCategories.set(category, currentCategories?.includes(category) ?? true);
          } else {
            this.generalCategories.set(category, currentCategories?.includes(category) ?? true);
          }
        });
      });
  }

  get selectedCategories(): string[] | undefined {
    const categoryGroups = [this.generalCategories, this.chapterCategories, this.tribeCategories];

    if (categoryGroups.every(group => Array.from(group.values()).every(checked => checked))) {
      return undefined;
    }

    const newCategories: string[] = [];
    categoryGroups.forEach(categories => {
      categories.forEach((value: boolean, key: string) => {
        if (value) {
          newCategories.push(key);
        }
      });
    });

    return newCategories;
  }

  checkAll(categories: Map<string, boolean>, checked: boolean) {
    categories.forEach((_: boolean, key: string) => {
      categories.set(key, checked);
    });
  }

  isAllChecked(categories: Map<string, boolean>) {
    return Array.from(categories.values()).every(x => x);
  }
}

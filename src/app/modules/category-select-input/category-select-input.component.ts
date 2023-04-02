import { ObjectUtil } from './../../utils/object.util';
import { Component, Input } from '@angular/core';
import { CategoryUtil } from 'src/app/utils/category.util';
import { FormControl } from '@angular/forms';

export interface ICategory {
  key: string;
  label: string;
}

@Component({
  selector: 'app-category-select-input',
  templateUrl: './category-select-input.component.html',
  styleUrls: ['./category-select-input.component.scss'],
})
export class CategorySelectInputComponent {
  totalCategoryCount?: number;
  selectedCategoryGroupIndex?: number;

  private readonly generalCategories: ICategory[] = [];
  private readonly chapterCategories: ICategory[] = [];
  private readonly tribeCategories: ICategory[] = [];

  readonly categoryGroups = new Map<string, ICategory[]>([
    ['Algemeen', this.generalCategories],
    ['Chapters', this.chapterCategories],
    ['Tribes', this.tribeCategories],
  ]);

  @Input() control!: FormControl<string[] | undefined>;
  @Input() set categories(value: string[]) {
    this.totalCategoryCount = value.length;

    value.forEach(c => {
      const category = { key: c, label: CategoryUtil.getLabel(c) };
      if (CategoryUtil.isChapter(c)) {
        this.chapterCategories.push(category);
      } else if (CategoryUtil.isTribe(c)) {
        this.tribeCategories.push(category);
      } else {
        this.generalCategories.push(category);
      }
    });
  }

  isAllChecked(categories: ICategory[]): boolean {
    return (
      ObjectUtil.isDefined(this.control.value) &&
      categories.every(category => ObjectUtil.mustBeDefined(this.control.value).some(c => c === category.key))
    );
  }

  isAnyChecked(categories: ICategory[]): boolean {
    return (
      ObjectUtil.isDefined(this.control.value) &&
      categories.some(category => ObjectUtil.mustBeDefined(this.control.value).some(c => c === category.key))
    );
  }

  countChecked(categories: ICategory[]): number {
    return ObjectUtil.isDefined(this.control.value)
      ? categories.filter(category => ObjectUtil.mustBeDefined(this.control.value).some(c => c === category.key)).length
      : 0;
  }

  setCategoryGroup(categories: ICategory[], checked: boolean) {
    if (!checked) {
      const newValue = this.control.value?.filter(selectedCategory => !categories.some(c => c.key === selectedCategory));
      this.control.setValue(newValue);
    } else {
      const newCategories = categories.filter(category => !this.control.value?.some(c => c === category.key)).map(c => c.key);
      this.control.setValue([...newCategories, ...(this.control.value ?? [])]);
    }
  }

  isChecked(category: string): boolean {
    return ObjectUtil.isDefined(this.control.value) ? this.control.value.includes(category) : false;
  }
}

import { Component, HostListener, OnDestroy } from '@angular/core';
import { TeamUpItService } from './services/team-up-it/team-up-it.service';
import { debounceTime, forkJoin, map, Subject, take, takeUntil, Observable, tap, combineLatest } from 'rxjs';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Event } from './services/team-up-it/models/upcoming-events-response';
import { ObjectUtil } from './utils/object.util';
import { TAny } from './utils/types';
import { MobileService } from './services/mobile/mobile.service';
import { CategoryUtil } from './utils/category.util';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';

// TODO Create seperate filter component
// TODO CHECK DATE PROP EVENT
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  private readonly searchParam = 'search';
  private readonly categoriesParam = 'categories';
  private readonly fromDateParam = 'fromDate';
  private readonly categorySplitter = ',';
  private readonly dateFormat = 'yyyy-MM-dd';

  //Events
  events: Event[] = [];
  eventCount = 0;
  eventCalendar?: Map<number, Map<number, Event[]>>;
  highlightedEvent?: Event;

  //Categories
  categories: string[] = [];
  selectedCategoryGroupIndex?: number;
  totalCategoryCount?: number;

  isLoading = true;
  isMobile?: boolean;

  private readonly generalCategories: string[] = [];
  private readonly chapterCategories: string[] = [];
  private readonly tribeCategories: string[] = [];

  readonly categoryGroups = new Map<string, string[]>([
    ['Algemeen', this.generalCategories],
    ['Chapters', this.chapterCategories],
    ['Tribes', this.tribeCategories],
  ]);

  readonly today = new Date();

  selectedCategoriesFormControl = new FormControl<string[]>([]);
  selectedFromDateFormControl = new FormControl<Date | undefined>(this.today);
  searchFormControl = new FormControl<string | undefined>(undefined);

  get selectedCategories(): string[] {
    return ObjectUtil.mustBeDefined(this.selectedCategoriesFormControl.value);
  }

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: TeamUpItService,
    private readonly mobileService: MobileService,
    private readonly router: Router,
    private readonly datePipe: DatePipe
  ) {
    this.mobileService.isDesktop$.pipe(takeUntil(this.destroy$)).subscribe(isDesktop => (this.isMobile = !isDesktop));

    forkJoin([this.loadEvents(), this.loadCategories(), this.loadQueryParams()])
      .pipe(take(1))
      .subscribe(
        ([_events, categories, queryParams]: [
          Event[],
          string[],
          {
            categories?: string[];
            fromDate?: Date;
            search?: string;
          }
        ]) => {
          const categories$ = this.selectedCategoriesFormControl.valueChanges.pipe(
            map(x => (ObjectUtil.isDefined(x) ? ObjectUtil.mustBeDefined(x) : []))
          );
          const fromDate$ = this.selectedFromDateFormControl.valueChanges.pipe(
            map(x =>
              ObjectUtil.isDefined(x) &&
              this.datePipe.transform(x, this.dateFormat) !== this.datePipe.transform(this.today, this.dateFormat)
                ? ObjectUtil.mustBeDefined(x)
                : undefined
            )
          );
          const search$ = this.searchFormControl.valueChanges.pipe(
            debounceTime(500),
            map(x => (ObjectUtil.isDefined(x) && x.trim() !== '' ? ObjectUtil.mustBeDefined(x.trim()) : undefined))
          );

          combineLatest([categories$, fromDate$, search$])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([categories, fromDate, search]: [string[], Date | undefined, string | undefined]) => {
              this.applyFilter(categories, fromDate, search);
            });

          this.selectedCategoriesFormControl.setValue(ObjectUtil.isDefined(queryParams.categories) ? queryParams.categories : categories);
          this.selectedFromDateFormControl.setValue(queryParams.fromDate);
          this.searchFormControl.setValue(queryParams.search);

          this.isLoading = false;
        }
      );
  }

  private loadEvents(): Observable<Event[]> {
    return this.service.getUpcomingEvents().pipe(
      take(1),
      map(result => result.upcomingEvents),
      tap(events => (this.events = events))
    );
  }

  private loadCategories(): Observable<string[]> {
    return this.service.getCategories().pipe(
      take(1),
      tap(categories => {
        this.categories = categories;
        this.totalCategoryCount = categories.length;

        categories.forEach(category => {
          if (CategoryUtil.isChapter(category)) {
            this.chapterCategories.push(category); //TODO REMOVE PREFIX
          } else if (CategoryUtil.isTribe(category)) {
            this.tribeCategories.push(category);
          } else {
            this.generalCategories.push(category);
          }
        });
      })
    );
  }

  private loadQueryParams(): Observable<{ categories?: string[]; fromDate?: Date; search?: string }> {
    return this.route.queryParams.pipe(
      debounceTime(10), //because sometimes the first emit is undefined
      take(1),
      map(params => {
        const categoriesValue = params[this.categoriesParam];
        const searchValue = params[this.searchParam];
        const fromDateValue = params[this.fromDateParam];

        return {
          categories: ObjectUtil.isDefined(categoriesValue)
            ? Array.isArray(categoriesValue)
              ? (categoriesValue as string[])
              : (categoriesValue as string).split(',')
            : undefined,
          fromDate: ObjectUtil.isDefined(fromDateValue) ? new Date(fromDateValue) : undefined,
          search: searchValue,
        };
      })
    );
  }

  applyFilter(categories: string[], fromDate?: Date, search?: string): void {
    this.eventCalendar = undefined;
    this.eventCount = 0;

    const calendar = new Map<number, Map<number, Event[]>>();
    this.isLoading = true;

    let events = this.events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    const queryParams: Params = {};

    if (ObjectUtil.isDefined(search)) {
      events = events.filter(event => event.title.toLowerCase().includes(search.toLowerCase()));
      queryParams[this.searchParam] = search;
    }

    if (ObjectUtil.isDefined(fromDate)) {
      events = events.filter(event => new Date(event.start).getTime() >= ObjectUtil.mustBeDefined<Date>(fromDate).getTime());
      queryParams[this.fromDateParam] = this.datePipe.transform(fromDate, this.dateFormat);
    }

    if (categories.length !== this.categories.length) {
      events = events.filter(event => event.categories.some(category => categories.some(c => c === category)));
      queryParams[this.categoriesParam] = categories.join(this.categorySplitter);
    }

    groupBy(events, e => new Date(e.start).getFullYear()).forEach((yearEvents, year) => {
      calendar.set(year, new Map());
      groupBy(yearEvents, e => new Date(e.start).getMonth()).forEach((monthEvents, month) => {
        calendar.get(year)?.set(month, monthEvents);
      });
    });

    this.eventCount = events.length;
    this.eventCalendar = calendar;
    this.isLoading = false;

    this.router.navigate([''], {
      queryParams,
    });
  }

  useMapOrder(_a: unknown, _b: unknown) {
    return 1;
  }

  setCategoryGroup(categories: string[], checked: boolean) {
    if (!checked) {
      const newValue = this.selectedCategories.filter(selectedCategory => !categories.includes(selectedCategory));
      this.selectedCategoriesFormControl.setValue(newValue);
    } else {
      const newCategories = categories.filter(category => !this.selectedCategories.includes(category));
      this.selectedCategoriesFormControl.setValue([...newCategories, ...this.selectedCategories]);
    }
  }

  onFilterChange(categories: Map<string, boolean>, key: string, checked: boolean) {
    categories.set(key, checked);
  }

  isAllChecked(categories: string[]) {
    return categories.every(category => this.selectedCategories.includes(category));
  }

  isAnyChecked(categories: string[]) {
    return categories.some(category => this.selectedCategories.includes(category));
  }

  countChecked(categories: string[]): number {
    return categories.filter(category => this.selectedCategories.includes(category)).length;
  }

  @HostListener('window:popstate', ['$event'])
  private onPopState(_event: TAny) {
    location.reload();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

export function groupBy<K, V>(array: V[], grouper: (item: V) => K) {
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

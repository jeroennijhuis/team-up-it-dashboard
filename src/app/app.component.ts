import { Component, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { TeamUpItService } from './services/team-up-it/team-up-it.service';
import { debounceTime, forkJoin, map, Subject, take, takeUntil, Observable, tap, combineLatest } from 'rxjs';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Event } from './services/team-up-it/models/upcoming-events-response';
import { ObjectUtil } from './utils/object.util';
import { TAny } from './utils/types';
import { MobileService } from './services/mobile/mobile.service';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ArrayUtil } from './utils/array.util';
import { CategorySelectInputComponent } from './modules/category-select-input/category-select-input.component';

// TODO HORIZTONAL x VERTICAL SCROLL
// TODO SCSS CLEAN UP
// TODO MODULE CLEAN UP
// TODO VALIDATE INPUTS
// TODO MOBILE BACKGROUND BUG
// TODO MOBILE YEAR ORIENTATION BUG
// TODO MOBILE TOOLBAR BACKGROUND ON SCROLL

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

  isLoading = true;
  isMobile?: boolean;

  @ViewChild(CategorySelectInputComponent) categorySelect!: CategorySelectInputComponent;

  readonly today = new Date();

  selectedCategoriesFormControl = new FormControl<string[] | undefined>([], { nonNullable: true });
  selectedFromDateFormControl = new FormControl<Date | undefined>(this.today);
  searchFormControl = new FormControl<string | undefined>(undefined);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: TeamUpItService,
    private readonly mobileService: MobileService,
    private readonly router: Router,
    private readonly datePipe: DatePipe
  ) {
    this.mobileService.isDesktop$.pipe(takeUntil(this.destroy$)).subscribe(isDesktop => (this.isMobile = !isDesktop));

    const categories$ = this.selectedCategoriesFormControl.valueChanges.pipe(
      map(x => (ObjectUtil.isDefined(x) ? ObjectUtil.mustBeDefined(x) : []))
    );
    const fromDate$ = this.selectedFromDateFormControl.valueChanges.pipe(
      map(x =>
        ObjectUtil.isDefined(x) && this.datePipe.transform(x, this.dateFormat) !== this.datePipe.transform(this.today, this.dateFormat)
          ? ObjectUtil.mustBeDefined(x)
          : undefined
      )
    );
    const search$ = this.searchFormControl.valueChanges.pipe(
      debounceTime(500),
      map(x => (ObjectUtil.isDefined(x) && x.trim() !== '' ? ObjectUtil.mustBeDefined(x.trim()) : undefined))
    );

    forkJoin([this.loadEvents(), this.loadQueryParams()])
      .pipe(take(1))
      .subscribe(
        ([_events, queryParams]: [
          Event[],
          {
            categories?: string[];
            fromDate?: Date;
            search?: string;
          }
        ]) => {
          combineLatest([categories$, fromDate$, search$])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([categories, fromDate, search]: [string[], Date | undefined, string | undefined]) => {
              this.applyFilter(categories, fromDate, search);
            });

          this.selectedCategoriesFormControl.setValue(queryParams.categories);

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

    if (categories.length !== this.categorySelect.totalCategoryCount) {
      events = events.filter(event => event.categories.some(category => categories.some(c => c === category)));
      queryParams[this.categoriesParam] = categories.join(this.categorySplitter);
    }

    ArrayUtil.groupBy(events, e => new Date(e.start).getFullYear()).forEach((yearEvents, year) => {
      calendar.set(year, new Map());
      ArrayUtil.groupBy(yearEvents, e => new Date(e.start).getMonth()).forEach((monthEvents, month) => {
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

  onFilterChange(categories: Map<string, boolean>, key: string, checked: boolean) {
    categories.set(key, checked);
  }

  @HostListener('window:popstate', ['$event'])
  private onPopState(_event: TAny) {
    location.reload();
  }

  @HostListener('wheel', ['$event'])
  verticalToHorizontalScroll(event: TAny) {
    if (this.isMobile) {
      return;
    }
    const listElem = ObjectUtil.mustBeDefined(document.getElementById('list-view'));
    listElem.scrollLeft += event.deltaY;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  log(x: TAny) {
    console.log(x);
  }
}

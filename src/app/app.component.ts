import { Component, HostListener, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { TeamUpItService } from './services/team-up-it/team-up-it.service';
import { debounceTime, forkJoin, map, Subject, take, takeUntil, Observable, tap, combineLatest } from 'rxjs';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { ObjectUtil } from './utils/object.util';
import { TAny } from './utils/types';
import { MobileService } from './services/mobile/mobile.service';
import { FormControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ArrayUtil } from './utils/array.util';
import { CategorySelectInputComponent } from './modules/category-select-input/category-select-input.component';
import { TeamUpItEvent } from './services/team-up-it/models/upcoming-events-response';

// TODO MOBILE BUGS
//  - Category select white background in focused state
//  - Background scrolls
//  - Toolbar should have a darker background on scroll

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  temp = Array.from(Array(50).keys());

  private readonly searchParam = 'search';
  private readonly categoriesParam = 'categories';
  private readonly fromDateParam = 'fromDate';
  private readonly categorySplitter = ',';
  private readonly dateFormat = 'yyyy-MM-dd';

  //Events
  events: TeamUpItEvent[] = [];
  categories?: string[];
  eventCount = 0;
  eventCalendar?: Map<number, Map<number, TeamUpItEvent[]>>;
  highlightedEvent?: TeamUpItEvent;

  isLoading = true;
  isMobile?: boolean;

  readonly today = new Date();

  selectedCategoriesFormControl = new FormControl<string[] | undefined>(undefined, { nonNullable: true });
  selectedFromDateFormControl = new FormControl<Date | undefined>(this.today);
  searchFormControl = new FormControl<string | undefined>(undefined);

  @ViewChild(CategorySelectInputComponent) categorySelect!: CategorySelectInputComponent;
  @ViewChild('listView', { static: false })
  set listView(elem: ElementRef) {
    if (ObjectUtil.isDefined(elem)) {
      setTimeout(() => (this.isLoading = false));
    }
  }

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

    forkJoin([this.loadEvents(), this.loadCategories(), this.loadQueryParams()])
      .pipe(take(1))
      .subscribe(
        ([_events, categories, queryParams]: [
          TeamUpItEvent[],
          string[],
          {
            categories?: string[];
            fromDate?: Date;
            search?: string;
          }
        ]) => {
          combineLatest([categories$, fromDate$, search$])
            .pipe(takeUntil(this.destroy$))
            .subscribe(([categories, fromDate, search]: [string[], Date | undefined, string | undefined]) => {
              this.eventCalendar = undefined;
              this.isLoading = true;
              this.eventCount = 0;

              setTimeout(() => this.applyFilter(categories, fromDate, search));
            });

          this.selectedCategoriesFormControl.setValue(queryParams.categories ?? categories);
          this.selectedFromDateFormControl.setValue(queryParams.fromDate);
          this.searchFormControl.setValue(queryParams.search);
        }
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadEvents(): Observable<TeamUpItEvent[]> {
    return this.service.getUpcomingEvents().pipe(
      take(1),
      map(result => result.upcomingEvents),
      tap(events => (this.events = events))
    );
  }

  private loadCategories(): Observable<string[]> {
    return this.service.getCategories().pipe(
      take(1),
      tap(categories => (this.categories = categories))
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
            ? (Array.isArray(categoriesValue) ? (categoriesValue as string[]) : (categoriesValue as string).split(',')).filter(
                c => c !== ''
              )
            : undefined,
          fromDate: ObjectUtil.isDefined(fromDateValue) ? new Date(fromDateValue) : undefined,
          search: searchValue,
        };
      })
    );
  }

  onFilterChange(categories: Map<string, boolean>, key: string, checked: boolean) {
    categories.set(key, checked);
  }

  private applyFilter(categories: string[], fromDate?: Date, search?: string): void {
    const calendar = new Map<number, Map<number, TeamUpItEvent[]>>();

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

    if (ObjectUtil.isDefined(categories) && categories.length !== this.categorySelect.totalCategoryCount) {
      events = events.filter(event => event.categories.some(category => categories.some(c => c === category)));
      queryParams[this.categoriesParam] = categories.join(this.categorySplitter);
    }

    ArrayUtil.groupBy(events, e => new Date(e.start).getFullYear()).forEach((yearEvents, year) => {
      calendar.set(year, new Map());
      ArrayUtil.groupBy(yearEvents, e => new Date(e.start).getMonth()).forEach((monthEvents, month) => {
        calendar.get(year)?.set(month, monthEvents);
      });
    });

    // calendar.forEach((value, key) => {
    //   const x = new Map(Array.from(value, a => a.reverse()));
    // });

    this.eventCount = events.length;
    this.eventCalendar = calendar;

    this.router.navigate([''], {
      queryParams,
    });
  }

  @HostListener('window:popstate', ['$event'])
  private onPopState(_event: TAny) {
    location.reload();
  }

  @HostListener('wheel', ['$event'])
  private verticalToHorizontalScroll(event: TAny) {
    if (this.isMobile) {
      return;
    }
    const listElem = ObjectUtil.mustBeDefined(document.getElementById('listView'));
    listElem.scrollLeft += event.deltaY;
  }
}

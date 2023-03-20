import { Component, HostListener, Injector, OnDestroy } from '@angular/core';
import { TeamUpItService } from './services/team-up-it/team-up-it.service';
import { count, debounceTime, interval, map, Observable, startWith, Subject, switchMap, take, takeUntil, tap } from 'rxjs';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Event } from './services/team-up-it/models/upcoming-events-response';
import { MatDialog } from '@angular/material/dialog';
import { CategorySelectDialogComponent } from './modules/category-select-dialog/category-select-dialog.component';
import { ToasterService } from './modules/toaster/toaster.service';
import { ObjectUtil } from './utils/object.util';
import { ArrayUtil } from './utils/array.util';
import { TAny } from './utils/types';
import { MobileService } from './services/mobile/mobile.service';
import { CategoryUtil } from './utils/category.util';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  categories: string[] = [];

  private readonly generalCategories: string[] = [];
  private readonly chapterCategories: string[] = [];
  private readonly tribeCategories: string[] = [];

  readonly categoryGroups = new Map<string, string[]>([
    ['Algemeen', this.generalCategories],
    ['Chapters', this.chapterCategories],
    ['Tribes', this.tribeCategories],
  ]);

  selectedCategoriesFormControl = new FormControl<string[]>([]);

  get selectedCategories(): string[] {
    return this.selectedCategoriesFormControl.value as string[];
  }

  private destroy$ = new Subject<void>();
  // Year - Month - events
  eventCalendar?: Map<number, Map<number, Event[]>>;
  highlightedEvent?: Event;
  eventCount = 0;
  selectedCategoryGroupIndex?: number;
  totalCategoryCount?: number;

  readonly today = new Date();

  search?: string;

  isMobile?: boolean;

  constructor(
    private readonly service: TeamUpItService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly dialog: MatDialog,
    private readonly injector: Injector,
    private readonly toasterService: ToasterService,
    private readonly mobileService: MobileService
  ) {
    route.queryParams
      .pipe(
        debounceTime(10), //because sometimes the first emit is undefined
        take(1),
        map(params => {
          const value = params['categories'];
          return ObjectUtil.isDefined(value) ? (Array.isArray(value) ? (value as string[]) : (value as string).split(',')) : undefined;
        }),
        switchMap(categories => this.loadEvents(categories ?? []))
      )
      .subscribe();

    service
      .getCategories()
      .pipe(take(1))
      .subscribe(categories => {
        this.totalCategoryCount = categories.length;

        categories.forEach(category => {
          if (CategoryUtil.isChapter(category)) {
            this.chapterCategories.push(category);
          } else if (CategoryUtil.isTribe(category)) {
            this.tribeCategories.push(category);
          } else {
            this.generalCategories.push(category);
          }
        });
      });

    this.mobileService.isDesktop$.pipe(takeUntil(this.destroy$)).subscribe(isDesktop => (this.isMobile = !isDesktop));
  }

  loadEvents(categories: string[]): Observable<Event[]> {
    this.eventCalendar = undefined;
    this.eventCount = 0;
    this.categories = categories;

    return this.service.getUpcomingEvents(categories).pipe(
      take(1),
      map(result => result.upcomingEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())),
      tap((events: Event[]) => {
        const calendar = new Map<number, Map<number, Event[]>>();
        events.forEach(event => {
          const date = new Date(event.start);
          const year = date.getFullYear();
          const month = date.getMonth();

          // Year
          if (!calendar.has(year)) {
            calendar.set(year, new Map());
          }
          const yearCalendar = ObjectUtil.mustBeDefined(calendar.get(year));

          // Month
          if (!yearCalendar.has(month)) {
            yearCalendar.set(month, []);
          }
          const monthCalendar = ObjectUtil.mustBeDefined(yearCalendar.get(month));

          // Event
          monthCalendar.push(event);
          this.eventCount++;
        });
        this.eventCalendar = calendar;
      })
    );
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

      //FIXME UNIQUE
      this.selectedCategoriesFormControl.setValue([...newCategories, ...this.selectedCategories]);
    }
  }

  onFilterChange(categories: Map<string, boolean>, key: string, checked: boolean) {
    console.log(categories, key, checked);
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

  openCategorySelect(): void {
    const injector = Injector.create({
      providers: [
        {
          provide: CategorySelectDialogComponent.CURRENT_CATEGORIES,
          useValue: this.categories,
        },
      ],
      parent: this.injector,
    });
    this.dialog
      .open<CategorySelectDialogComponent, undefined, string[]>(CategorySelectDialogComponent, { injector })
      .afterClosed()
      .subscribe((categories?: string[]) => {
        let navExtras: NavigationExtras = {
          relativeTo: this.route,
        };

        if (categories !== undefined && categories.length > 0) {
          navExtras = {
            ...navExtras,
            queryParams: {
              categories: categories?.join(','),
            },
          };
        }

        this.router.navigate([], navExtras);
        const isChanged = !ArrayUtil.equals(this.categories, categories);

        if (isChanged) {
          this.loadEvents(categories ?? []).subscribe(_ => this.toasterService.show('Dashboard bijgewerkt', '🤘'));
        }
      });
  }

  autoPlay(period = 5000): void {
    interval(period)
      .pipe(takeUntil(this.destroy$), startWith(-1))
      .subscribe(counter => {
        let index = (counter % this.eventCount) + 1;

        this.eventCalendar?.forEach((months, _year) => {
          months.forEach((events, _month) => {
            events.forEach(event => {
              if (events.indexOf(event) === index) {
                this.highlightedEvent = event;
                return;
              }
            });
            index -= events.length;
          });
        });
      });
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

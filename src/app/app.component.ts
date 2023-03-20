import { Component, HostListener, OnDestroy } from '@angular/core';
import { TeamUpItService } from './services/team-up-it/team-up-it.service';
import { debounceTime, distinctUntilChanged, interval, map, startWith, Subject, take, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Event } from './services/team-up-it/models/upcoming-events-response';
import { ObjectUtil } from './utils/object.util';
import { TAny } from './utils/types';
import { MobileService } from './services/mobile/mobile.service';
import { CategoryUtil } from './utils/category.util';
import { FormControl } from '@angular/forms';

// TODO Create seperate filter component
// TODO QUERY PARAMS FOR DATE AND SEARCH

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
  categories: string[] = [];
  events: Event[] = [];
  isLoading = true;

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
  selectedFromDateFormControl = new FormControl<Date>(this.today);
  searchFormControl = new FormControl<string>('');

  get selectedCategories(): string[] {
    return ObjectUtil.mustBeDefined(this.selectedCategoriesFormControl.value);
  }

  get selectedFromDate(): Date {
    return ObjectUtil.mustBeDefined(this.selectedFromDateFormControl.value);
  }

  get search(): string {
    return ObjectUtil.mustBeDefined(this.searchFormControl.value);
  }

  private destroy$ = new Subject<void>();
  // Year - Month - events
  eventCalendar?: Map<number, Map<number, Event[]>>;
  highlightedEvent?: Event;
  eventCount = 0;
  selectedCategoryGroupIndex?: number;
  totalCategoryCount?: number;
  isMobile?: boolean;

  constructor(route: ActivatedRoute, private readonly service: TeamUpItService, private readonly mobileService: MobileService) {
    this.loadEvents();

    service
      .getCategories()
      .pipe(take(1))
      .subscribe(categories => {
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

        this.selectedCategoriesFormControl.valueChanges.pipe(takeUntil(this.destroy$), distinctUntilChanged()).subscribe(_ => {
          this.loadEvents2();
        });

        this.selectedFromDateFormControl.valueChanges.pipe(takeUntil(this.destroy$), distinctUntilChanged()).subscribe(_ => {
          this.loadEvents2();
        });

        this.searchFormControl.valueChanges.pipe(takeUntil(this.destroy$), distinctUntilChanged(), debounceTime(500)).subscribe(_ => {
          this.loadEvents2();
        });

        route.queryParams
          .pipe(
            debounceTime(10), //because sometimes the first emit is undefined
            take(1),
            map(params => {
              const value = params['categories'];
              return ObjectUtil.isDefined(value)
                ? Array.isArray(value)
                  ? (value as string[])
                  : (value as string).split(',')
                : [...this.generalCategories, ...this.chapterCategories, ...this.tribeCategories];
            })
          )
          .subscribe(categories => this.selectedCategoriesFormControl.setValue(categories));
      });

    this.mobileService.isDesktop$.pipe(takeUntil(this.destroy$)).subscribe(isDesktop => (this.isMobile = !isDesktop));
  }

  loadEvents(): void {
    this.service
      .getUpcomingEvents()
      .pipe(
        take(1),
        map(result => result.upcomingEvents)
      )
      .subscribe(events => {
        this.events = events;
      });
  }

  loadEvents2(): void {
    this.eventCalendar = undefined;
    this.eventCount = 0;

    const calendar = new Map<number, Map<number, Event[]>>();
    this.isLoading = true;
    this.events
      // Filter by search terms
      .filter(event => {
        const match = this.search.trim().toLowerCase();
        return match === '' || event.title.toLowerCase().includes(match);
      })

      // Filter by Date
      .filter(event => new Date(event.start).getTime() >= this.selectedFromDate.getTime())

      // Filter by category
      .filter(event => event.categories.some(category => this.selectedCategories.some(c => c === category)))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .forEach(event => {
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
    this.isLoading = false;
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

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { UpcomingEventsResponse } from './models/upcoming-events-response';
import { EventCategoriesResponse } from './models/event-categories-response';

@Injectable()
export class TeamUpItService {
  private readonly basePath = 'https://calendar.teamupit.nl';
  private readonly defaultHeaders = new HttpHeaders();

  constructor(private readonly httpClient: HttpClient) {}

  getCategories(): Observable<string[]> {
    return this.httpClient
      .get<EventCategoriesResponse>(`${this.basePath}/eventcategories`)
      .pipe(map((result: EventCategoriesResponse) => result.eventCategories));
  }

  getUpcomingEvents(categories?: string[]): Observable<UpcomingEventsResponse> {
    let params = new HttpParams();
    if (categories !== undefined) {
      params = params.set('categories', categories.join(', '));
    }
    return this.httpClient.get<UpcomingEventsResponse>(`${this.basePath}/upcomingevents`, {
      headers: this.defaultHeaders,
      params,
    });
  }
}

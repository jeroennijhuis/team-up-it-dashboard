import { Observable, of } from 'rxjs';
import { UpcomingEventsResponse } from '../../app/services/team-up-it/models/upcoming-events-response';
import { TeamUpItService } from '../../app/services/team-up-it/team-up-it.service';

export const teamUpItServiceStub: Partial<TeamUpItService> = {
  getCategories(): Observable<string[]> {
    return of(['Chapter Test', 'Tribe test', 'General']);
  },

  getUpcomingEvents(categories?: string[]): Observable<UpcomingEventsResponse> {
    return of({
      count: 3,
      categoryFilter: categories?.join(','),
      upcomingEvents: [],
    } as UpcomingEventsResponse);
  },
};

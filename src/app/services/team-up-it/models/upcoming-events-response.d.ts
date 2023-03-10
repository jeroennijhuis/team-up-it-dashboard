export interface UpcomingEventsResponse {
  count: number;
  categoryFilter: string;
  upcomingEvents: Event[];
}

export interface Event {
  id: number;
  slug: string;
  title: string;
  description: string;
  categories: string[];
  location: string;
  locationLink: string;
  start: string;
  end: string;
  spots: number;
  signUpPageUrl: string;
}

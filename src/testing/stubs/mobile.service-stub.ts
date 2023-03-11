import { Observable, of } from 'rxjs';
import { MobileService } from 'src/app/services/mobile/mobile.service';

export const mobileServiceStub: Partial<MobileService> = {
  get isDesktop$(): Observable<boolean> {
    return of(true);
  },
};

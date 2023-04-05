import { Injectable } from '@angular/core';
import { distinctUntilChanged, Observable, ReplaySubject, startWith } from 'rxjs';

@Injectable()
export class MobileService {
  private readonly isDesktopSubject$ = new ReplaySubject<boolean>(1);

  constructor() {
    window.addEventListener('resize', _ => {
      this.isDesktopSubject$.next(this.isDestopResolution());
    });
  }
  get isDesktop$(): Observable<boolean> {
    return this.isDesktopSubject$.asObservable().pipe(startWith(this.isDestopResolution()), distinctUntilChanged());
  }

  private isDestopResolution(): boolean {
    return window.innerWidth > 925;
  }
}

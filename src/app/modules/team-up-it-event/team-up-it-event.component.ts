import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { TeamUpItEvent } from 'src/app/services/team-up-it/models/upcoming-events-response';

@Component({
  selector: 'app-team-up-it-event',
  templateUrl: './team-up-it-event.component.html',
  styleUrls: ['./team-up-it-event.component.scss'],
})
export class TeamUpItEventComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @Input() event!: TeamUpItEvent;
  @Input() isOpened = false;
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  ngOnInit(): void {
    if (this.event === undefined) {
      throw new Error('EventComponent missing event input.');
    }
  }

  goToSignUpPage() {
    window.open(this.event.signUpPageUrl, '_blank');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

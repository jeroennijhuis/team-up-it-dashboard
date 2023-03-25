import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { MobileService } from 'src/app/services/mobile/mobile.service';
import { TeamUpItEvent } from 'src/app/services/team-up-it/models/upcoming-events-response';

@Component({
  selector: 'app-team-up-it-event',
  templateUrl: './team-up-it-event.component.html',
  styleUrls: ['./team-up-it-event.component.scss'],
})
export class TeamUpItEventComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  @ViewChild('detailCard') detailCard!: ElementRef;
  @Input() event!: TeamUpItEvent;
  @Input() isOpened = false;
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  constructor(private readonly renderer: Renderer2, private readonly mobileService: MobileService) {}

  ngOnInit(): void {
    if (this.event === undefined) {
      throw new Error('EventComponent missing event input.');
    }
  }

  ngAfterViewInit(): void {
    // not required for list view
    this.mobileService.isDesktop$.pipe(take(1)).subscribe(isDesktop => {
      if (isDesktop) {
        this.horizontalAlign();
      }
    });
  }

  goToSignUpPage() {
    window.open(this.event.signUpPageUrl, '_blank');
  }

  // Sets component height to assure that all events are correctly horizontally aligned
  private horizontalAlign(): void {
    const currentHeight = this.detailCard.nativeElement.offsetHeight;
    const gap = document.documentElement.clientHeight * 0.01 * 3; // 3vh
    const divider = 80 + gap;
    let rows = Math.ceil((currentHeight - gap) / divider);
    const remainder = (currentHeight - gap) % divider;

    if (remainder > 0) {
      rows++;
    }

    this.renderer.setStyle(this.detailCard.nativeElement, 'height', `${rows * divider - gap}px`);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Event } from 'src/app/services/team-up-it/models/upcoming-events-response';

@Component({
  selector: 'app-team-up-it-event',
  templateUrl: './team-up-it-event.component.html',
  styleUrls: ['./team-up-it-event.component.scss'],
})
export class TeamUpItEventComponent implements OnInit, AfterViewInit {
  @ViewChild('detailCard') detailCard!: ElementRef;
  @Input() event!: Event;
  @Input() isOpened = false;
  @Output() opened = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  constructor(private readonly renderer: Renderer2) {}
  ngOnInit(): void {
    if (this.event === undefined) {
      throw new Error('EventComponent missing event input.');
    }
  }
  ngAfterViewInit(): void {
    this.horizontalAlign();
  }
  goToSignUpPage() {
    window.open(this.event.signUpPageUrl, '_blank');
  } // Sets component height to assure that all events are correctly horizontally aligned

  private horizontalAlign(): void {
    const currentHeight = this.detailCard.nativeElement.offsetHeight;
    const offset = 85;
    const divider = 110;
    const remainder = (currentHeight - offset) % divider;
    const newHeight = remainder === 0 ? currentHeight : currentHeight - remainder + divider;
    this.renderer.setStyle(this.detailCard.nativeElement, 'height', `${newHeight}px`);
  }
}

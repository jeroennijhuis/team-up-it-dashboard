import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatGridListModule } from '@angular/material/grid-list';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { TeamUpItEventComponent } from './team-up-it-event.component';
import { MobileService } from 'src/app/services/mobile/mobile.service';

@NgModule({
  declarations: [TeamUpItEventComponent],
  imports: [
    CommonModule,
    BrowserAnimationsModule,

    /* Material */
    MatCardModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatIconModule,
    MatGridListModule,
    MatButtonModule,
    MatChipsModule,
  ],
  providers: [MobileService],
  exports: [TeamUpItEventComponent],
})
export class TeamUpItEventModule {}

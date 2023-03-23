import { TeamUpItEventModule } from './modules/event/team-up-it-event.module';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TeamUpItService } from './services/team-up-it/team-up-it.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DatePipe, registerLocaleData } from '@angular/common';
import myLocaleNl from '@angular/common/locales/nl';
import { ToasterModule } from './modules/toaster/toaster.module';
import { MobileService } from './services/mobile/mobile.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { CustomDateAdapter } from './utils/custom.date.adapter';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';

registerLocaleData(myLocaleNl);

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,

    ToasterModule,
    TeamUpItEventModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatToolbarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatExpansionModule,
    MatCheckboxModule,
  ],
  providers: [
    TeamUpItService,
    MobileService,
    DatePipe,
    { provide: MAT_DATE_LOCALE, useValue: 'nl-NL' },
    { provide: DateAdapter, useClass: CustomDateAdapter },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

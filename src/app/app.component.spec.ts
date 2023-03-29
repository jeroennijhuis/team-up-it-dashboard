import { MatIconModule } from '@angular/material/icon';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { TeamUpItService } from './services/team-up-it/team-up-it.service';
import { toasterServiceStub } from '../testing/stubs/toaster.service-stub';
import { ToasterService } from './modules/toaster/toaster.service';
import { teamUpItServiceStub } from 'src/testing/stubs/team-up-it.service-stub copy';
import { MobileService } from './services/mobile/mobile.service';
import { mobileServiceStub } from 'src/testing/stubs/mobile.service-stub';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { CustomDateAdapter } from './utils/custom.date.adapter';
import { MatSelectModule } from '@angular/material/select';
import { DatePipe } from '@angular/common';
import { CategorySelectInputComponent } from './modules/category-select-input/category-select-input.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        MatDialogModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSelectModule,
        MatIconModule,
      ],
      providers: [
        DatePipe,
        { provide: TeamUpItService, useValue: teamUpItServiceStub },
        { provide: ToasterService, useValue: toasterServiceStub },
        { provide: MobileService, useValue: mobileServiceStub },

        { provide: MAT_DATE_LOCALE, useValue: 'nl-NL' },
        { provide: DateAdapter, useClass: CustomDateAdapter },
      ],
      declarations: [AppComponent, CategorySelectInputComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

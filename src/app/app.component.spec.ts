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

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, MatDialogModule],
      providers: [
        { provide: TeamUpItService, useValue: teamUpItServiceStub },
        { provide: ToasterService, useValue: toasterServiceStub },
        { provide: MobileService, useValue: mobileServiceStub },
      ],
      declarations: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});

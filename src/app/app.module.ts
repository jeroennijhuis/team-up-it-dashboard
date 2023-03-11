import { TeamUpItEventModule } from './modules/event/team-up-it-event.module';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TeamUpItService } from './services/team-up-it/team-up-it.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import myLocaleNl from '@angular/common/locales/nl';
import { CategorySelectDialogModule } from './modules/category-select-dialog/category-select-dialog.module';
import { ToasterModule } from './modules/toaster/toaster.module';
import { MobileService } from './services/mobile/mobile.service';

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
    CategorySelectDialogModule,
  ],
  providers: [TeamUpItService, MobileService],
  bootstrap: [AppComponent],
})
export class AppModule {}

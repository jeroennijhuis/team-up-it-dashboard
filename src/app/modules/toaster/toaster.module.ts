import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ToasterService } from './toaster.service';

@NgModule({
  providers: [ToasterService],
  imports: [MatSnackBarModule],
})
export class ToasterModule {}

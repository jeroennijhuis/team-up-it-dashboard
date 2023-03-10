import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategorySelectDialogComponent } from './category-select-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [CategorySelectDialogComponent],
  imports: [
    CommonModule,
    FormsModule,

    /* Material */
    MatDialogModule,
    MatCheckboxModule,
    MatButtonModule,
  ],
  exports: [CategorySelectDialogComponent],
})
export class CategorySelectDialogModule {}

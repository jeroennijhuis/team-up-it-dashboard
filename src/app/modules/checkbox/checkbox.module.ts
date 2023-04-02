import { NgModule } from '@angular/core';
import { CheckboxComponent } from './checkbox.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [CheckboxComponent],
  imports: [CommonModule, FormsModule],
  exports: [CheckboxComponent],
})
export class CheckboxModule {}

import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { CategorySelectInputComponent } from './category-select-input.component';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from '../checkbox/checkbox.module';

@NgModule({
  declarations: [CategorySelectInputComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    /* Material */
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatExpansionModule,
    CheckboxModule,
  ],
  exports: [CategorySelectInputComponent],
})
export class CategorySelectInputModule {}

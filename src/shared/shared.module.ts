import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material';

import { FileDropModule } from 'ngx-file-drop';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
    FileDropModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatCheckboxModule,
    MatInputModule,
  ]
})
export class SharedModule { }
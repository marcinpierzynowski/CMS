import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';

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
    MatCheckboxModule
  ]
})
export class SharedModule { }

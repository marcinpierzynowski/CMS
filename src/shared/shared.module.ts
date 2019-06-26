import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule, MatCardModule, MatButtonModule, MatInputModule, MatSelectModule, MatStepperModule, MatTooltipModule, MatAutocompleteModule, MatSlideToggleModule, MAT_CHECKBOX_CLICK_ACTION } from '@angular/material';
import { ClipboardModule } from 'ngx-clipboard';
import { FileDropModule } from 'ngx-file-drop';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCheckboxModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    ClipboardModule,
    MatSelectModule,
    MatStepperModule,
    FileDropModule,
    MatTooltipModule,
    MatAutocompleteModule,
    MatSlideToggleModule
],
  providers: [
    { provide: MAT_CHECKBOX_CLICK_ACTION, useValue: "check" }
  ]
})
export class SharedModule { }
import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { invalid, validationMessage } from './validators';
@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'app-field-error',
  template: `@if (invalid(control())) {
    <span class="invalid-feedback d-block" [id]="errorId()" role="status">{{
      validationMessage(control().errors, label())
    }}</span>
  }`,
})
export class FieldError {
  control = input.required<AbstractControl>();
  label = input.required<string>();
  errorId = input.required<string>();
  invalid = invalid;
  validationMessage = validationMessage;
}

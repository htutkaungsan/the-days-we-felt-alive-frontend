import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { FormControl, Validators } from '@angular/forms';
import {
  notBlank,
  validEmail,
  strongPassword,
  passwordBytes,
  wholeNumber,
  twoDecimals,
  invalid,
  validationMessage,
} from './validators';
describe('Client validation matches API rules', () => {
  it('rejects blank names and invalid emails', () => {
    expect(new FormControl('   ', notBlank).invalid).toBe(true);
    expect(new FormControl('name@example.com', validEmail).valid).toBe(true);
    expect(new FormControl('name@', validEmail).invalid).toBe(true);
  });
  it('requires strong new passwords and enforces UTF-8 bytes', () => {
    for (const value of ['password123!', 'PASSWORD123!', 'Password!!!', 'Password123'])
      expect(new FormControl(value, strongPassword).invalid).toBe(true);
    expect(new FormControl('GoodPass123!', [strongPassword, passwordBytes]).valid).toBe(true);
    expect(new FormControl('A1!' + 'အ'.repeat(24), passwordBytes).invalid).toBe(true);
    expect(new FormControl('', strongPassword).valid).toBe(true); // optional password on edit
  });
  it('rejects fractional copies/days and money beyond two decimals', () => {
    expect(new FormControl(1.5, wholeNumber).invalid).toBe(true);
    expect(new FormControl(0.1, twoDecimals).valid).toBe(true);
    expect(new FormControl(12.345, twoDecimals).invalid).toBe(true);
    const days = new FormControl(31, [Validators.min(1), Validators.max(30), wholeNumber]);
    expect(days.invalid).toBe(true);
    days.setValue(30);
    expect(days.valid).toBe(true);
  });
  it('shows required feedback after blur and clears it when corrected', () => {
    const name = new FormControl('', Validators.required);
    expect(invalid(name)).toBe(false);
    name.markAsTouched();
    expect(invalid(name)).toBe(true);
    expect(validationMessage(name.errors, 'Name')).toBe('Name is required.');
    name.setValue('Customer');
    expect(invalid(name)).toBe(false);
  });
});

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
export const notBlank: ValidatorFn = (control) =>
  typeof control.value === 'string' && !control.value.trim() ? { blank: true } : null;
export const validEmail: ValidatorFn = (control) =>
  control.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(control.value).trim())
    ? { email: true }
    : null;
export const passwordBytes: ValidatorFn = (control) =>
  new TextEncoder().encode(String(control.value || '')).length > 72
    ? { passwordBytes: true }
    : null;
export const strongPassword: ValidatorFn = (control) => {
  const value = String(control.value || '');
  return value &&
    (!/[a-z]/.test(value) ||
      !/[A-Z]/.test(value) ||
      !/[0-9]/.test(value) ||
      !/[^a-zA-Z0-9\s]/.test(value))
    ? { passwordStrength: true }
    : null;
};
export const wholeNumber: ValidatorFn = (control) =>
  control.value !== null && control.value !== '' && !Number.isInteger(control.value)
    ? { wholeNumber: true }
    : null;
export const twoDecimals: ValidatorFn = (control) => {
  const value = control.value;
  return value !== null &&
    value !== '' &&
    Math.abs(value * 100 - Math.round(value * 100)) > 0.000001
    ? { twoDecimals: true }
    : null;
};
export const allowedValues =
  (values: string[]): ValidatorFn =>
  (control) =>
    values.includes(control.value) ? null : { choice: true };
export function invalid(control: AbstractControl): boolean {
  return control.invalid && (control.touched || control.dirty);
}
export function validationMessage(errors: ValidationErrors | null, label: string): string {
  if (!errors) return '';
  if (errors['required'] || errors['blank']) return `${label} is required.`;
  if (errors['email']) return 'Enter a valid email address.';
  if (errors['minlength'])
    return `${label} must have at least ${errors['minlength'].requiredLength} characters.`;
  if (errors['maxlength'])
    return `${label} must have at most ${errors['maxlength'].requiredLength} characters.`;
  if (errors['passwordBytes']) return 'Password must be at most 72 bytes.';
  if (errors['passwordStrength'])
    return 'Use uppercase and lowercase letters, a number, and a symbol.';
  if (errors['wholeNumber']) return `${label} must be a whole number.`;
  if (errors['twoDecimals']) return `${label} can have at most two decimal places.`;
  if (errors['min']) return `${label} must be at least ${errors['min'].min}.`;
  if (errors['max']) return `${label} must be at most ${errors['max'].max}.`;
  return `Choose a valid ${label.toLowerCase()}.`;
}

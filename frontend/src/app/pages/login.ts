import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Auth } from '../core/auth';
import { Api } from '../core/api';
import { FieldError } from '../core/field-error';
import { invalid, notBlank, validEmail, passwordBytes, strongPassword } from '../core/validators';
import { message } from '../core/types';
@Component({
  imports: [ReactiveFormsModule, FieldError, RouterLink],
  template: ` <section class="auth-layout">
    <div class="auth-story">
      <p class="eyebrow">WELCOME TO THE SHOP</p>
      <h1>Make room for<br />something good.</h1>
      <p>Your next favorite album or movie might be waiting on our shelf.</p>
      <div class="record" aria-hidden="true">
        <span>ALIVE<br />RECORDS</span>
      </div>
    </div>
    <div class="form-panel">
      <p class="eyebrow">{{ register ? 'A NEW CHAPTER' : 'GOOD TO SEE YOU' }}</p>
      <h2>{{ register ? 'Join the shop' : 'Sign in' }}</h2>
      <p>
        {{
          register
            ? 'Create an account to rent from our collection.'
            : 'Pick up where you left off.'
        }}
      </p>
      @if (error()) {
        <p role="alert" class="alert error">{{ error() }}</p>
      }
      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (register) {
          <label
            >Your name<input
              class="form-control"
              [class.is-invalid]="invalid(form.controls.name)"
              [attr.aria-invalid]="invalid(form.controls.name)"
              aria-describedby="login-name-error"
              name="name"
              formControlName="name"
              required
              maxlength="100"
              autocomplete="name" /><app-field-error
              [control]="form.controls.name"
              label="Name"
              errorId="login-name-error"
          /></label>
        }
        <label
          >Email address<input
            class="form-control"
            [class.is-invalid]="invalid(form.controls.email)"
            [attr.aria-invalid]="invalid(form.controls.email)"
            aria-describedby="login-email-error"
            type="email"
            name="email"
            formControlName="email"
            required
            email
            maxlength="150"
            autocomplete="email" /><app-field-error
            [control]="form.controls.email"
            label="Email"
            errorId="login-email-error"
        /></label>
        <label
          >Password<input
            class="form-control"
            [class.is-invalid]="invalid(form.controls.password)"
            [attr.aria-invalid]="invalid(form.controls.password)"
            aria-describedby="login-password-error"
            type="password"
            name="password"
            formControlName="password"
            required
            minlength="8"
            [autocomplete]="register ? 'new-password' : 'current-password'" /><app-field-error
            [control]="form.controls.password"
            label="Password"
            errorId="login-password-error"
        /></label>
        @if (register) {
          <small
            >8+ characters with uppercase, lowercase, a number and a symbol. Maximum 72
            bytes.</small
          >
        }
        <button [disabled]="busy() || form.invalid">
          {{ busy() ? 'Please wait…' : register ? 'Create account' : 'Sign in' }}
        </button>
      </form>
      <p class="form-bottom">
        {{ register ? 'Already a member?' : 'New around here?' }}
        <a [routerLink]="register ? '/login' : '/register'">{{
          register ? 'Sign in' : 'Create an account'
        }}</a>
      </p>
    </div>
  </section>`,
})
export class Login {
  private router = inject(Router);
  private auth = inject(Auth);
  private api = inject(Api);
  private fb = inject(FormBuilder);
  invalid = invalid;
  get register() {
    return this.router.url === '/register';
  }
  form = this.fb.nonNullable.group({
    name: ['', [Validators.maxLength(100)]],
    email: ['', [Validators.required, validEmail, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(8), passwordBytes]],
  });
  constructor() {
    if (this.register) {
      this.form.controls.name.addValidators([Validators.required, notBlank]);
      this.form.controls.password.addValidators(strongPassword);
      this.form.controls.name.updateValueAndValidity();
      this.form.controls.password.updateValueAndValidity();
    }
  }
  busy = signal(false);
  error = signal('');
  async submit() {
    if (this.busy()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, password } = this.form.getRawValue();
    this.busy.set(true);
    this.error.set('');
    try {
      if (this.register)
        await firstValueFrom(
          this.api.post('/auth/register', {
            name: name.trim(),
            email: email.trim(),
            password: password,
          }),
        );
      await firstValueFrom(this.auth.login(email.trim(), password));
      await this.router.navigate([this.auth.user()?.role === 'admin' ? '/admin' : '/']);
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.busy.set(false);
    }
  }
}

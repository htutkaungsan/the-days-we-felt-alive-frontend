import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Api } from '../core/api';
import { FieldError } from '../core/field-error';
import { invalid, notBlank, validEmail, passwordBytes, strongPassword } from '../core/validators';
import { User, message } from '../core/types';
@Component({
  imports: [ReactiveFormsModule, FieldError],
  template: `<div class="section-heading">
      <h2>Customers</h2>
      <button class="small" (click)="edit()">Add customer</button>
    </div>
    @if (error()) {
      <p role="alert" class="alert error">{{ error() }}</p>
    }
    @if (notice()) {
      <p role="status" class="alert success">{{ notice() }}</p>
    }
    @if (loading()) {
      <p class="empty">Loading customers…</p>
    } @else {
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (u of items(); track u.id) {
              <tr>
                <td>{{ u.name }}</td>
                <td>{{ u.email }}</td>
                <td>{{ u.active ? 'Active' : 'Inactive' }}</td>
                <td class="table-actions">
                  <button class="text-button" (click)="edit(u)" [disabled]="busy()">Edit</button
                  ><button class="text-button danger" (click)="pending.set(u)" [disabled]="busy()">
                    Delete
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="4">No customers yet.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
    @if (open()) {
      <div class="shop-overlay">
        <section
          class="shop-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="customer-form-title"
        >
          <h2 id="customer-form-title">{{ id ? 'Edit customer' : 'Add customer' }}</h2>
          <form [formGroup]="form" (ngSubmit)="save()" novalidate>
            <label
              >Name<input
                class="form-control"
                [class.is-invalid]="invalid(form.controls.name)"
                [attr.aria-invalid]="invalid(form.controls.name)"
                aria-describedby="customer-management-name-error"
                name="name"
                formControlName="name"
                required
                maxlength="100" /><app-field-error
                [control]="form.controls.name"
                label="Name"
                errorId="customer-management-name-error" /></label
            ><label
              >Email<input
                class="form-control"
                [class.is-invalid]="invalid(form.controls.email)"
                [attr.aria-invalid]="invalid(form.controls.email)"
                aria-describedby="customer-management-email-error"
                type="email"
                name="email"
                formControlName="email"
                required
                email
                maxlength="150" /><app-field-error
                [control]="form.controls.email"
                label="Email"
                errorId="customer-management-email-error" /></label
            ><label
              >{{ id ? 'New password (optional)' : 'Password'
              }}<input
                class="form-control"
                [class.is-invalid]="invalid(form.controls.password)"
                [attr.aria-invalid]="invalid(form.controls.password)"
                aria-describedby="customer-management-password-error"
                type="password"
                name="password"
                formControlName="password"
                minlength="8"
                autocomplete="new-password" /><app-field-error
                [control]="form.controls.password"
                label="Password"
                errorId="customer-management-password-error"
            /></label>
            @if (id) {
              <label class="checkbox"
                ><input
                  class="form-check-input"
                  type="checkbox"
                  name="active"
                  formControlName="active"
                />
                Active account</label
              >
            }
            @if (formError()) {
              <p role="alert" class="alert error">{{ formError() }}</p>
            }
            <div class="actions">
              <button type="button" class="secondary" (click)="open.set(false)" [disabled]="busy()">
                Cancel</button
              ><button [disabled]="busy() || form.invalid">
                {{ busy() ? 'Saving…' : 'Save customer' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    }
    @if (pending(); as record) {
      <div class="shop-overlay">
        <section class="shop-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <h2 id="delete-title">Delete customer?</h2>
          <p>{{ record.name }}</p>
          <p>
            Records with rental history will be deactivated. Active rentals must be returned first.
          </p>
          <div class="actions">
            <button type="button" class="secondary" (click)="pending.set(null)" [disabled]="busy()">
              Cancel</button
            ><button (click)="remove(record)" [disabled]="busy()">Confirm delete</button>
          </div>
        </section>
      </div>
    } `,
})
export class CustomerManagement {
  private api = inject(Api);
  private fb = inject(FormBuilder);
  invalid = invalid;
  pending = signal<User | null>(null);
  items = signal<User[]>([]);
  loading = signal(true);
  busy = signal(false);
  error = signal('');
  notice = signal('');
  formError = signal('');
  open = signal(false);
  id = 0;
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, notBlank, Validators.maxLength(100)]],
    email: ['', [Validators.required, validEmail, Validators.maxLength(150)]],
    password: ['', [Validators.required, Validators.minLength(8), passwordBytes, strongPassword]],
    active: [true],
  });
  constructor() {
    void this.load();
  }
  async load() {
    try {
      this.items.set((await firstValueFrom(this.api.get<User[]>('/customers'))).data);
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.loading.set(false);
    }
  }
  edit(u?: User) {
    this.id = u?.id || 0;
    this.form.reset({
      name: u?.name || '',
      email: u?.email || '',
      password: '',
      active: u ? !!u.active : true,
    });
    this.form.controls.password.setValidators([
      Validators.minLength(8),
      passwordBytes,
      strongPassword,
      ...(!u ? [Validators.required] : []),
    ]);
    this.form.controls.password.updateValueAndValidity();
    this.formError.set('');
    this.open.set(true);
  }
  async save() {
    if (this.busy()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.busy.set(true);
    this.formError.set('');
    try {
      const body: Record<string, unknown> = { name: value.name.trim(), email: value.email.trim() };
      if (value.password) body['password'] = value.password;
      if (this.id) body['active'] = value.active;
      await firstValueFrom(
        this.id ? this.api.patch('/customers/' + this.id, body) : this.api.post('/customers', body),
      );
      this.open.set(false);
      this.notice.set('Customer saved.');
      await this.load();
    } catch (e) {
      this.formError.set(message(e));
    } finally {
      this.busy.set(false);
    }
  }
  async remove(u: User) {
    if (this.busy()) return;
    this.pending.set(null);
    this.busy.set(true);
    this.error.set('');
    try {
      this.notice.set((await firstValueFrom(this.api.delete('/customers/' + u.id))).data.message);
      await this.load();
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.busy.set(false);
    }
  }
}

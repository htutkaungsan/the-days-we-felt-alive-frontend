import { Notice } from '../core/notifications';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Api } from '../core/api';
import { FieldError } from '../core/field-error';
import { invalid, notBlank, wholeNumber, twoDecimals, allowedValues } from '../core/validators';
import { Media, message } from '../core/types';
const empty = () => ({
  title: '',
  creator: '',
  category: 'music',
  format: 'CD',
  total_copies: 1,
  daily_fee: 15,
  daily_late_fee: 5,
  archived: false,
});
@Component({
  imports: [Notice, ReactiveFormsModule, FieldError, CurrencyPipe],
  template: `<div class="section-heading">
      <h2>Media collection</h2>
      <button class="small" (click)="edit()">Add media</button>
    </div>
    @if (error()) {
      <app-notice [message]="error()" kind="error" />
    }
    @if (notice()) {
      <app-notice [message]="notice()" kind="success" />
    }
    @if (loading()) {
      <p class="empty">Loading media…</p>
    } @else {
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Title / creator</th>
              <th>Category / format</th>
              <th>Copies</th>
              <th>Fees per day</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (m of items(); track m.id) {
              <tr>
                <td>
                  <strong>{{ m.title }}</strong
                  ><small>{{ m.creator }}</small>
                </td>
                <td>{{ m.category }} / {{ m.format }}</td>
                <td>{{ m.available_copies }} / {{ m.total_copies }} available</td>
                <td>
                  {{ m.daily_fee | currency: 'THB'
                  }}<small>Late: {{ m.daily_late_fee | currency: 'THB' }}</small>
                </td>
                <td>{{ m.archived ? 'Archived' : 'Listed' }}</td>
                <td class="table-actions">
                  <button class="text-button" (click)="edit(m)" [disabled]="busy()">Edit</button
                  ><button class="text-button danger" (click)="pending.set(m)" [disabled]="busy()">
                    Delete
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6">No media yet.</td>
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
          aria-labelledby="media-form-title"
        >
          <h2 id="media-form-title">{{ id ? 'Edit media' : 'Add media' }}</h2>
          <form [formGroup]="form" (ngSubmit)="save()" novalidate>
            <label
              >Title<input
                class="form-control"
                [class.is-invalid]="invalid(form.controls.title)"
                [attr.aria-invalid]="invalid(form.controls.title)"
                aria-describedby="media-management-title-error"
                name="title"
                formControlName="title"
                required
                maxlength="150" /><app-field-error
                [control]="form.controls.title"
                label="Title"
                errorId="media-management-title-error" /></label
            ><label
              >Artist / director<input
                class="form-control"
                [class.is-invalid]="invalid(form.controls.creator)"
                [attr.aria-invalid]="invalid(form.controls.creator)"
                aria-describedby="media-management-creator-error"
                name="creator"
                formControlName="creator"
                required
                maxlength="150" /><app-field-error
                [control]="form.controls.creator"
                label="Artist / director"
                errorId="media-management-creator-error"
            /></label>
            <div class="form-row">
              <label
                >Category<select class="form-select" name="category" formControlName="category">
                  <option value="music">Music</option>
                  <option value="movie">Movie</option>
                </select></label
              ><label
                >Format<select class="form-select" name="format" formControlName="format">
                  <option>CD</option>
                  <option>DVD</option>
                </select></label
              >
            </div>
            <label
              >Total copies<input
                class="form-control"
                [class.is-invalid]="invalid(form.controls.total_copies)"
                [attr.aria-invalid]="invalid(form.controls.total_copies)"
                aria-describedby="media-management-total_copies-error"
                type="number"
                name="copies"
                formControlName="total_copies"
                required
                min="1"
                max="999"
                step="1" /><app-field-error
                [control]="form.controls.total_copies"
                label="Total copies"
                errorId="media-management-total_copies-error"
            /></label>
            <div class="form-row">
              <label
                >Daily fee (THB)<input
                  class="form-control"
                  [class.is-invalid]="invalid(form.controls.daily_fee)"
                  [attr.aria-invalid]="invalid(form.controls.daily_fee)"
                  aria-describedby="media-management-daily_fee-error"
                  type="number"
                  name="daily"
                  formControlName="daily_fee"
                  required
                  min="0"
                  max="9999.99"
                  step="0.01" /><app-field-error
                  [control]="form.controls.daily_fee"
                  label="Daily fee"
                  errorId="media-management-daily_fee-error" /></label
              ><label
                >Daily late fee (THB)<input
                  class="form-control"
                  [class.is-invalid]="invalid(form.controls.daily_late_fee)"
                  [attr.aria-invalid]="invalid(form.controls.daily_late_fee)"
                  aria-describedby="media-management-daily_late_fee-error"
                  type="number"
                  name="late"
                  formControlName="daily_late_fee"
                  required
                  min="0"
                  max="9999.99"
                  step="0.01" /><app-field-error
                  [control]="form.controls.daily_late_fee"
                  label="Daily late fee"
                  errorId="media-management-daily_late_fee-error"
              /></label>
            </div>
            @if (id) {
              <label class="checkbox"
                ><input
                  class="form-check-input"
                  type="checkbox"
                  name="archived"
                  formControlName="archived"
                />
                Archive from public catalog</label
              >
            }
            @if (formError()) {
              <app-notice [message]="formError()" kind="error" />
            }
            <div class="actions">
              <button type="button" class="secondary" (click)="open.set(false)" [disabled]="busy()">
                Cancel</button
              ><button [disabled]="busy() || form.invalid">
                {{ busy() ? 'Saving…' : 'Save media' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    }
    @if (pending(); as record) {
      <div class="shop-overlay">
        <section class="shop-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title">
          <h2 id="delete-title">Delete media?</h2>
          <p>{{ record.title }}</p>
          <p>
            Records with rental history will be archived. Active rentals must be returned first.
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
export class MediaManagement {
  private api = inject(Api);
  private fb = inject(FormBuilder);
  invalid = invalid;
  pending = signal<Media | null>(null);
  items = signal<Media[]>([]);
  loading = signal(true);
  busy = signal(false);
  error = signal('');
  notice = signal('');
  formError = signal('');
  open = signal(false);
  id = 0;
  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, notBlank, Validators.maxLength(150)]],
    creator: ['', [Validators.required, notBlank, Validators.maxLength(150)]],
    category: ['music', [allowedValues(['music', 'movie'])]],
    format: ['CD', [allowedValues(['CD', 'DVD'])]],
    total_copies: [1, [Validators.required, Validators.min(1), Validators.max(999), wholeNumber]],
    daily_fee: [15, [Validators.required, Validators.min(0), Validators.max(9999.99), twoDecimals]],
    daily_late_fee: [
      5,
      [Validators.required, Validators.min(0), Validators.max(9999.99), twoDecimals],
    ],
    archived: [false],
  });
  constructor() {
    void this.load();
  }
  async load() {
    try {
      this.items.set((await firstValueFrom(this.api.get<Media[]>('/media'))).data);
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.loading.set(false);
    }
  }
  edit(m?: Media) {
    this.id = m?.id || 0;
    this.form.reset(
      m
        ? {
            title: m.title,
            creator: m.creator,
            category: m.category,
            format: m.format,
            total_copies: m.total_copies,
            daily_fee: m.daily_fee,
            daily_late_fee: m.daily_late_fee,
            archived: !!m.archived,
          }
        : empty(),
    );
    this.formError.set('');
    this.open.set(true);
  }
  async save() {
    this.notice.set('');
    if (this.busy()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    value.title = value.title.trim();
    value.creator = value.creator.trim();
    this.busy.set(true);
    this.formError.set('');
    try {
      const { archived, ...body } = value;
      await firstValueFrom(
        this.id ? this.api.patch('/media/' + this.id, value) : this.api.post('/media', body),
      );
      this.open.set(false);
      this.notice.set('Media saved.');
      await this.load();
    } catch (e) {
      this.formError.set(message(e));
    } finally {
      this.busy.set(false);
    }
  }
  async remove(m: Media) {
    this.notice.set('');
    if (this.busy()) return;
    this.pending.set(null);
    this.busy.set(true);
    this.error.set('');
    try {
      this.notice.set((await firstValueFrom(this.api.delete('/media/' + m.id))).data.message);
      await this.load();
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.busy.set(false);
    }
  }
}

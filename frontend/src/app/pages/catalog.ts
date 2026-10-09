import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Api } from '../core/api';
import { FieldError } from '../core/field-error';
import { invalid, wholeNumber, allowedValues } from '../core/validators';
import { Auth } from '../core/auth';
import { Media, message } from '../core/types';
@Component({
  imports: [ReactiveFormsModule, FieldError, CurrencyPipe, RouterLink],
  template: ` <section class="hero">
      <div>
        <p class="eyebrow">FOR THE DAYS WORTH REMEMBERING</p>
        <h1>Press play.<br />Feel something.</h1>
        <p>
          Albums for slow afternoons. Movies for nights in.<br />Find a favorite and take it home.
        </p>
        <a href="#collection" class="button"
          >Explore the collection <span aria-hidden="true">↗</span></a
        >
      </div>
      <div class="hero-record">
        <div class="record" aria-hidden="true">
          <span>THE DAYS<br />WE FELT<br />ALIVE</span>
        </div>
        <p>GOOD STORIES NEVER GET OLD</p>
      </div>
    </section>
    <section id="collection" class="collection">
      <div class="section-heading">
        <div>
          <p class="eyebrow">ON OUR SHELVES</p>
          <h2>The collection</h2>
        </div>
        <span>{{ items().length }} titles to discover</span>
      </div>
      <form class="filters" [formGroup]="filters" (ngSubmit)="load()" novalidate>
        <label class="search-label"
          >Search titles<input
            name="search"
            formControlName="search"
            placeholder="Search for your next favorite…"
            maxlength="150" /></label
        ><label
          >Category<select class="form-select" name="category" formControlName="category">
            <option value="">All categories</option>
            <option value="music">Music</option>
            <option value="movie">Movies</option>
          </select></label
        ><label
          >Format<select class="form-select" name="format" formControlName="format">
            <option value="">All formats</option>
            <option>CD</option>
            <option>DVD</option>
          </select></label
        ><button [disabled]="loading() || filters.invalid">Search</button>
      </form>
      @if (error()) {
        <p role="alert" class="alert error">{{ error() }}</p>
      }
      @if (success()) {
        <p role="status" class="alert success">
          {{ success() }} <a routerLink="/my-rentals">View my rentals</a>
        </p>
      }
      @if (loading()) {
        <p class="empty">Loading the collection…</p>
      } @else {
        <div class="media-grid row g-4">
          @for (item of items(); track item.id) {
            <div class="col-12 col-md-6 col-lg-4">
              <article class="media-card h-100">
                <div class="cover" [class.movie]="item.category === 'movie'">
                  <span class="cover-label"
                    >{{ item.category === 'music' ? 'ALIVE RECORDS' : 'ALIVE CINEMA' }} /
                    {{ item.format }}</span
                  >
                  <div class="mini-disc" aria-hidden="true"></div>
                  <span class="cover-title">{{ item.title }}</span>
                </div>
                <div class="media-details">
                  <div class="meta">
                    <span>{{ item.category }} · {{ item.format }}</span
                    ><span [class.unavailable]="!item.available_copies">{{
                      item.available_copies ? item.available_copies + ' available' : 'Out of stock'
                    }}</span>
                  </div>
                  <h3>{{ item.title }}</h3>
                  <p>{{ item.creator }}</p>
                  <div class="card-bottom">
                    <strong
                      >{{ item.daily_fee | currency: 'THB' : 'symbol' : '1.2-2'
                      }}<small> / day</small></strong
                    >
                    @if (auth.user()?.role === 'customer') {
                      <button
                        class="small"
                        [disabled]="!item.available_copies"
                        (click)="choose(item)"
                      >
                        Rent a copy
                      </button>
                    } @else if (!auth.user()) {
                      <a routerLink="/login" class="text-link">Sign in to rent ↗</a>
                    }
                  </div>
                </div>
              </article>
            </div>
          } @empty {
            <p class="empty">No titles found. Try another search.</p>
          }
        </div>
      }
    </section>
    @if (selected(); as item) {
      <div class="shop-overlay">
        <section class="shop-dialog" role="dialog" aria-modal="true" aria-labelledby="rental-title">
          <p class="eyebrow">TAKE A FAVORITE HOME</p>
          <h2 id="rental-title">{{ item.title }}</h2>
          <p>One {{ item.format }} copy · Return at the shop</p>
          <form [formGroup]="rentalForm" (ngSubmit)="rent()" novalidate>
            <label
              >Rental days<input
                class="form-control"
                [class.is-invalid]="invalid(rentalForm.controls.days)"
                [attr.aria-invalid]="invalid(rentalForm.controls.days)"
                aria-describedby="catalog-days-error"
                type="number"
                name="days"
                formControlName="days"
                min="1"
                max="30"
                step="1"
                required
                (input)="key = ''"
                autofocus /><app-field-error
                [control]="rentalForm.controls.days"
                label="Rental days"
                errorId="catalog-days-error"
            /></label>
            <div class="fee-preview">
              <span>Rental fee</span><strong>{{ item.daily_fee * days | currency: 'THB' }}</strong>
            </div>
            <p class="muted">
              Late returns cost {{ item.daily_late_fee | currency: 'THB' }} per calendar day after
              the due date. Your rental starts today.
            </p>
            @if (rentalError()) {
              <p role="alert" class="alert error">{{ rentalError() }}</p>
            }
            <div class="actions">
              <button
                type="button"
                class="secondary"
                (click)="selected.set(null)"
                [disabled]="renting()"
              >
                Cancel</button
              ><button [disabled]="renting() || rentalForm.invalid || !validDays()">
                {{ renting() ? 'Confirming…' : 'Confirm rental' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    }`,
})
export class Catalog {
  auth = inject(Auth);
  private api = inject(Api);
  private fb = inject(FormBuilder);
  invalid = invalid;
  items = signal<Media[]>([]);
  loading = signal(true);
  error = signal('');
  success = signal('');
  filters = this.fb.nonNullable.group({
    search: ['', Validators.maxLength(150)],
    category: ['', allowedValues(['', 'music', 'movie'])],
    format: ['', allowedValues(['', 'CD', 'DVD'])],
  });
  selected = signal<Media | null>(null);
  rentalForm = this.fb.nonNullable.group({
    days: [3, [Validators.required, Validators.min(1), Validators.max(30), wholeNumber]],
  });
  get days() {
    return this.rentalForm.controls.days.value;
  }
  key = '';
  renting = signal(false);
  rentalError = signal('');
  constructor() {
    void this.load();
  }
  async load() {
    if (this.filters.invalid) {
      this.filters.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set('');
    try {
      const q = new URLSearchParams();
      const { search, category, format } = this.filters.getRawValue();
      if (search.trim()) q.set('search', search.trim());
      if (category) q.set('category', category);
      if (format) q.set('format', format);
      this.items.set(
        (await firstValueFrom(this.api.get<Media[]>('/media?' + q))).data.filter(
          (m) => !m.archived,
        ),
      );
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.loading.set(false);
    }
  }
  choose(item: Media) {
    this.selected.set(item);
    this.rentalForm.reset({ days: 3 });
    this.key = '';
    this.rentalError.set('');
    this.success.set('');
  }
  validDays() {
    return Number.isInteger(this.days) && this.days >= 1 && this.days <= 30;
  }
  async rent() {
    const item = this.selected();
    if (!item || this.renting()) return;
    if (this.rentalForm.invalid) {
      this.rentalForm.markAllAsTouched();
      return;
    }
    this.renting.set(true);
    this.rentalError.set('');
    if (!this.key) this.key = crypto.randomUUID();
    try {
      await firstValueFrom(
        this.api.post('/rentals', { media_id: item.id, days: this.days, request_key: this.key }),
      );
      this.selected.set(null);
      this.success.set('Rental confirmed. Collect your copy at the shop.');
      await this.load();
    } catch (e) {
      this.rentalError.set(message(e));
    } finally {
      this.renting.set(false);
    }
  }
}

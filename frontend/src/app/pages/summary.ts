import { Notice } from '../core/notifications';
import { Component, inject, signal, computed } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Api } from '../core/api';
import { Media, User, Rental, message } from '../core/types';
@Component({
  imports: [Notice, CurrencyPipe, RouterLink],
  template: `<h2>Shop overview</h2>
    @if (error()) {
      <app-notice [message]="error()" kind="error" />
    }
    @if (loading()) {
      <p class="empty">Loading overview…</p>
    } @else {
      <div class="stats">
        <article>
          <small>CATALOG TITLES</small><strong>{{ media().filter(activeMedia).length }}</strong>
        </article>
        <article>
          <small>ACTIVE CUSTOMERS</small
          ><strong>{{ customers().filter(activeCustomer).length }}</strong>
        </article>
        <article>
          <small>OUT ON RENTAL</small><strong>{{ active().length }}</strong>
        </article>
        <article>
          <small>OVERDUE</small><strong>{{ overdue().length }}</strong>
        </article>
      </div>
      <div class="summary-note">
        <h3>
          {{ overdue().length ? 'Some favorites are due back.' : 'The shelves are in good hands.' }}
        </h3>
        <p>
          Recorded fees from returned rentals:
          <strong>{{ returnedTotal() | currency: 'THB' }}</strong
          >. This total records rental charges, not payments.
        </p>
        <a class="button" routerLink="/admin/rentals">Manage returns ↗</a>
      </div>
    }`,
})
export class Summary {
  private api = inject(Api);
  media = signal<Media[]>([]);
  customers = signal<User[]>([]);
  rentals = signal<Rental[]>([]);
  error = signal('');
  loading = signal(true);
  activeMedia = (m: Media) => !m.archived;
  activeCustomer = (u: User) => u.active;
  active = computed(() => this.rentals().filter((r) => !r.returned_on));
  overdue = computed(() => this.rentals().filter((r) => r.status === 'overdue'));
  returnedTotal = computed(() =>
    this.rentals()
      .filter((r) => r.returned_on)
      .reduce((s, r) => s + r.total, 0),
  );
  constructor() {
    void this.load();
  }
  async load() {
    try {
      const [m, u, r] = await Promise.all([
        firstValueFrom(this.api.get<Media[]>('/media')),
        firstValueFrom(this.api.get<User[]>('/customers')),
        firstValueFrom(this.api.get<Rental[]>('/rentals')),
      ]);
      this.media.set(m.data);
      this.customers.set(u.data);
      this.rentals.set(r.data);
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.loading.set(false);
    }
  }
}

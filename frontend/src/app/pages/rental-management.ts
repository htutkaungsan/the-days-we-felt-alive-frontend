import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Api } from '../core/api';
import { Rental, message } from '../core/types';
@Component({
  imports: [FormsModule, CurrencyPipe],
  template: `<div class="section-heading">
      <h2>Rentals & returns</h2>
      <button class="secondary small" (click)="load()" [disabled]="loading() || busy()">
        Refresh
      </button>
    </div>
    <p>
      Confirm a return after receiving the physical copy. Late fees use the original rental rate.
    </p>
    <label class="compact-label"
      >Show<select name="filter" [(ngModel)]="filter" (ngModelChange)="status.set($event)">
        <option value="all">All rentals</option>
        <option value="active">Active & overdue</option>
        <option value="overdue">Overdue only</option>
        <option value="returned">Returned</option>
      </select></label
    >
    @if (error()) {
      <p role="alert" class="alert error">{{ error() }}</p>
    }
    @if (notice()) {
      <p role="status" class="alert success">{{ notice() }}</p>
    }
    @if (loading()) {
      <p class="empty">Loading rentals…</p>
    } @else {
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Rental / title</th>
              <th>Customer</th>
              <th>Due / returned</th>
              <th>Status</th>
              <th>Total (THB)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            @for (r of visible(); track r.id) {
              <tr>
                <td>
                  <strong>#{{ r.id }} · {{ r.title }}</strong
                  ><small>{{ r.rented_on }} · {{ r.rental_days }} days</small>
                </td>
                <td>
                  {{ r.customer_name }}<small>{{ r.customer_email }}</small>
                </td>
                <td>
                  {{ r.due_on
                  }}<small>{{
                    r.returned_on ? 'Returned ' + r.returned_on : 'Not returned yet'
                  }}</small>
                </td>
                <td>
                  <span class="status" [class.overdue]="r.status === 'overdue'">{{
                    r.status
                  }}</span>
                </td>
                <td>
                  {{ (r.returned_on ? r.total : r.estimated_total) | currency: 'THB'
                  }}<small>Late: {{ r.estimated_late_fee | currency: 'THB' }}</small>
                </td>
                <td>
                  @if (!r.returned_on) {
                    <button class="small" (click)="pending.set(r)" [disabled]="busy()">
                      Receive return
                    </button>
                  }
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6">No matching rentals.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
    @if (pending(); as rental) {
      <div class="shop-overlay">
        <section class="shop-dialog" role="dialog" aria-modal="true" aria-labelledby="return-title">
          <h2 id="return-title">Receive this return?</h2>
          <p>{{ rental.title }} · {{ rental.customer_name }}</p>
          <p>Confirm after receiving the physical copy at the shop.</p>
          <div class="fee-preview">
            <span>Estimated total</span
            ><strong>{{ rental.estimated_total | currency: 'THB' }}</strong>
          </div>
          <div class="actions">
            <button class="secondary" (click)="pending.set(null)" [disabled]="busy()">Cancel</button
            ><button (click)="receive(rental)" [disabled]="busy()">Confirm return</button>
          </div>
        </section>
      </div>
    } `,
})
export class RentalManagement {
  private api = inject(Api);
  pending = signal<Rental | null>(null);
  items = signal<Rental[]>([]);
  status = signal('all');
  filter = 'all';
  visible = computed(() =>
    this.items().filter(
      (r) =>
        this.status() === 'all' ||
        (this.status() === 'active' ? !r.returned_on : r.status === this.status()),
    ),
  );
  loading = signal(true);
  busy = signal(false);
  error = signal('');
  notice = signal('');
  constructor() {
    void this.load();
  }
  async load() {
    this.loading.set(true);
    try {
      this.items.set((await firstValueFrom(this.api.get<Rental[]>('/rentals'))).data);
      this.error.set('');
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.loading.set(false);
    }
  }
  async receive(r: Rental) {
    if (this.busy()) return;
    this.pending.set(null);
    this.busy.set(true);
    this.error.set('');
    try {
      const returned = (
        await firstValueFrom(this.api.patch<Rental>('/rentals/' + r.id, { status: 'returned' }))
      ).data;
      this.notice.set('Return recorded. Final total: THB ' + returned.total.toFixed(2));
      await this.load();
    } catch (e) {
      this.error.set(message(e));
    } finally {
      this.busy.set(false);
    }
  }
}

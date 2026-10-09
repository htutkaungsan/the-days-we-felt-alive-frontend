import { Component, Injectable, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
export type NoticeKind = 'success' | 'error' | 'info';
interface Toast {
  id: number;
  message: string;
  kind: NoticeKind;
  title: string;
  actionLabel: string;
  actionPath: string;
}
@Injectable({ providedIn: 'root' })
export class Notifications {
  items = signal<Toast[]>([]);
  private nextId = 0;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();
  show(message: string, kind: NoticeKind = 'info', title = '', actionLabel = '', actionPath = '') {
    if (!message.trim()) return;
    const duplicate = this.items().find((t) => t.message === message && t.kind === kind);
    if (duplicate) {
      this.resume(duplicate.id);
      return;
    }
    const id = ++this.nextId;
    const headings = { success: 'All set', error: 'Something went wrong', info: 'From the shop' };
    if (this.items().length >= 3) this.dismiss(this.items()[0].id);
    this.items.update((items) => [
      ...items,
      { id, message, kind, title: title || headings[kind], actionLabel, actionPath },
    ]);
    this.resume(id);
  }
  dismiss(id: number) {
    this.pause(id);
    this.items.update((items) => items.filter((t) => t.id !== id));
  }
  pause(id: number) {
    const timer = this.timers.get(id);
    if (timer !== undefined) clearTimeout(timer);
    this.timers.delete(id);
  }
  resume(id: number) {
    this.pause(id);
    const toast = this.items().find((t) => t.id === id);
    if (!toast) return;
    this.timers.set(
      id,
      setTimeout(() => this.dismiss(id), toast.actionPath ? 12000 : 8000),
    );
  }
}

// Bridges existing page message signals into the shared toast outlet.
@Component({ selector: 'app-notice', template: '' })
export class Notice {
  message = input.required<string>();
  kind = input<NoticeKind>('info');
  title = input('');
  actionLabel = input('');
  actionPath = input('');
  private notifications = inject(Notifications);
  constructor() {
    effect(() => {
      const message = this.message(),
        kind = this.kind(),
        title = this.title(),
        label = this.actionLabel(),
        path = this.actionPath();
      untracked(() => this.notifications.show(message, kind, title, label, path));
    });
  }
}
@Component({
  selector: 'app-toasts',
  imports: [RouterLink],
  template: `<aside class="toast-stack" aria-label="Shop notifications">
    @for (toast of notifications.items(); track toast.id) {
      <section
        class="shop-toast"
        [class.toast-error]="toast.kind === 'error'"
        [class.toast-success]="toast.kind === 'success'"
        [attr.role]="toast.kind === 'error' ? 'alert' : 'status'"
        aria-atomic="true"
        (mouseenter)="notifications.pause(toast.id)"
        (mouseleave)="notifications.resume(toast.id)"
        (focusin)="notifications.pause(toast.id)"
        (focusout)="notifications.resume(toast.id)"
      >
        <span class="toast-mark" aria-hidden="true">{{ toast.kind === 'error' ? '!' : '◉' }}</span>
        <div class="toast-copy">
          <p class="toast-eyebrow">THE DAYS WE FELT ALIVE</p>
          <h2>{{ toast.title }}</h2>
          <p>{{ toast.message }}</p>
          @if (toast.actionPath) {
            <a [routerLink]="toast.actionPath" (click)="notifications.dismiss(toast.id)"
              >{{ toast.actionLabel }} <span aria-hidden="true">↗</span></a
            >
          }
        </div>
        <button
          class="toast-close"
          type="button"
          [attr.aria-label]="'Dismiss notification: ' + toast.title"
          (click)="notifications.dismiss(toast.id)"
        >
          ×
        </button>
      </section>
    }
  </aside>`,
})
export class Toasts {
  notifications = inject(Notifications);
}

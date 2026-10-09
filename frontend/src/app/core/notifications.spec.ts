import '@angular/compiler';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Notifications } from './notifications';

describe('Shop notification lifecycle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it('deduplicates messages, caps visible notices, and clears dismissed timers', () => {
    const notices = new Notifications();
    notices.show('Saved', 'success');
    notices.show('Saved', 'success');
    expect(notices.items()).toHaveLength(1);
    notices.show('Second');
    notices.show('Third');
    notices.show('Fourth');
    expect(notices.items().map((t) => t.message)).toEqual(['Second', 'Third', 'Fourth']);
    notices.dismiss(notices.items()[0].id);
    vi.advanceTimersByTime(8000);
    expect(notices.items()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  });
  it('keeps a rental action available while paused and resumes its dismissal timer', () => {
    const notices = new Notifications();
    notices.show(
      'Rental confirmed',
      'success',
      'Your copy is ready',
      'View my rentals',
      '/my-rentals',
    );
    const id = notices.items()[0].id;
    vi.advanceTimersByTime(8000);
    expect(notices.items()[0].actionPath).toBe('/my-rentals');
    notices.pause(id);
    vi.advanceTimersByTime(30000);
    expect(notices.items()).toHaveLength(1);
    notices.resume(id);
    vi.advanceTimersByTime(12000);
    expect(notices.items()).toHaveLength(0);
  });
});

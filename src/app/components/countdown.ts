import { Component, DestroyRef, inject, signal } from '@angular/core';

/** Counts down to the end of the current day, when today's deals reset. */
@Component({
  selector: 'kd-countdown',
  template: `<span class="inline-flex items-center gap-1.5 text-[13px] text-ink-soft">Ends in
    <span class="font-semibold tabular-nums rounded bg-sale text-white px-1.5 py-0.5" role="timer">{{ left() }}</span></span>`,
})
export class Countdown {
  left = signal(this.compute());
  constructor() {
    const t = setInterval(() => this.left.set(this.compute()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(t));
  }
  private compute(): string {
    const now = new Date();
    const end = new Date(now);
    end.setHours(24, 0, 0, 0);
    const s = Math.floor((end.getTime() - now.getTime()) / 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  }
}

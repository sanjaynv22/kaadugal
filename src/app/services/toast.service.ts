import { Injectable, signal } from '@angular/core';

export interface Toast { text: string; link?: string; linkText?: string; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly current = signal<Toast | null>(null);
  private timer?: ReturnType<typeof setTimeout>;
  show(toast: Toast) {
    this.current.set(toast);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.current.set(null), 3200);
  }
  dismiss() { this.current.set(null); }
}

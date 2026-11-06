import { Injectable, signal } from '@angular/core';
import { load, save } from './storage';

export interface DeliveryLocation { city: string; pincode: string; }

/** Lightweight per-browser shopper context: delivery location, recently viewed. */
@Injectable({ providedIn: 'root' })
export class ShopperService {
  readonly location = signal<DeliveryLocation | null>(load('location', null));
  readonly recent = signal<number[]>(load('recent', []));

  setLocation(l: DeliveryLocation) { this.location.set(l); save('location', l); }
  viewed(id: number) {
    this.recent.set([id, ...this.recent().filter((x) => x !== id)].slice(0, 16));
    save('recent', this.recent());
  }
}

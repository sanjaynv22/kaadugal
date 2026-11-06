import { Injectable, computed, inject, signal } from '@angular/core';
import { CartItem, CartLine, Totals } from '../models';
import { CatalogService } from './catalog.service';
import { load, save } from './storage';

export const MAX_QTY = 10;
export const FREE_DELIVERY_FROM = 499;

export function totalsFor(items: CartItem[]): Totals {
  const mrp = items.reduce((s, i) => s + i.product.mrp * i.qty, 0);
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const delivery = !items.length || subtotal >= FREE_DELIVERY_FROM ? 0 : 49;
  return { mrp, subtotal, discount: mrp - subtotal, delivery, total: subtotal + delivery, count: items.reduce((s, i) => s + i.qty, 0) };
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private catalog = inject(CatalogService);
  private lines = signal<CartLine[]>(load('cart', []));

  readonly items = computed<CartItem[]>(() =>
    this.lines().flatMap((l) => {
      const product = this.catalog.get(l.productId);
      return product ? [{ product, qty: l.qty }] : [];
    }),
  );
  readonly totals = computed(() => totalsFor(this.items()));
  readonly count = computed(() => this.totals().count);
  /** Items whose stock dropped below the quantity in the cart. */
  readonly unavailable = computed(() => this.items().filter((i) => i.qty > i.product.stock));

  private update(lines: CartLine[]) { this.lines.set(lines); save('cart', lines); }
  limit(productId: number): number { return Math.min(MAX_QTY, this.catalog.get(productId)?.stock ?? 0); }
  qty(productId: number): number { return this.lines().find((l) => l.productId === productId)?.qty ?? 0; }

  add(productId: number, qty = 1) {
    this.setQty(productId, this.qty(productId) + qty);
  }

  setQty(productId: number, qty: number) {
    const next = Math.min(qty, this.limit(productId));
    if (next <= 0) return this.remove(productId);
    const exists = this.lines().some((l) => l.productId === productId);
    this.update(exists ? this.lines().map((l) => (l.productId === productId ? { ...l, qty: next } : l)) : [...this.lines(), { productId, qty: next }]);
  }

  remove(productId: number) { this.update(this.lines().filter((l) => l.productId !== productId)); }
  clear() { this.update([]); }
}

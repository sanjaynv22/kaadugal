import { Injectable, computed, inject, signal } from '@angular/core';
import { Address, CartItem, Order, OrderStatus, Totals } from '../models';
import { AuthService } from './auth.service';
import { CatalogService } from './catalog.service';
import { load, save } from './storage';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private auth = inject(AuthService);
  private catalog = inject(CatalogService);
  private orders = signal<Order[]>(load('orders', []));
  readonly all = this.orders.asReadonly();
  readonly mine = computed(() => this.orders().filter((o) => o.email === this.auth.user()?.email));

  get(id: string) { return this.mine().find((o) => o.id === id); }

  place(items: CartItem[], totals: Totals, address: Address, payment: string): Order {
    const now = new Date();
    const order: Order = {
      id: 'KD' + now.getTime().toString().slice(-8) + Math.floor(Math.random() * 90 + 10),
      email: this.auth.user()!.email,
      placedAt: now.toISOString(),
      deliverBy: new Date(now.getTime() + 4 * 864e5).toISOString(),
      lines: items.map((i) => ({ productId: i.product.id, slug: i.product.slug, title: i.product.title, thumb: i.product.thumb, price: i.product.price, qty: i.qty })),
      totals, address, payment, status: 'Confirmed',
    };
    this.orders.update((l) => [order, ...l]);
    save('orders', this.orders());
    items.forEach((i) => this.catalog.adjustStock(i.product.id, -i.qty));
    return order;
  }

  /** Cancelling returns the items to stock, so a cancelled order can't be reopened. */
  setStatus(id: string, status: OrderStatus) {
    const order = this.orders().find((o) => o.id === id);
    if (!order || order.status === 'Cancelled' || order.status === status) return;
    this.orders.update((l) => l.map((o) => (o.id === id ? { ...o, status } : o)));
    save('orders', this.orders());
    if (status === 'Cancelled') order.lines.forEach((l) => this.catalog.adjustStock(l.productId, l.qty));
  }

  cancel(id: string) { this.setStatus(id, 'Cancelled'); }
}

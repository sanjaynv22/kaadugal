import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PriceBreakdown } from '../components/order-summary';
import { EmptyState, ImgFallback, InrPipe } from '../components/ui';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'kd-order-confirmation',
  imports: [RouterLink, DatePipe, PriceBreakdown, EmptyState, ImgFallback, InrPipe],
  template: `
    <div class="page py-6 max-w-[860px]">
      @if (order(); as o) {
        <div class="bg-forest text-white rounded-md p-5 on-dark">
          <h1 class="text-[26px] font-bold">Order placed</h1>
          <p class="mt-1">Arriving by {{ o.deliverBy | date: 'EEEE, d MMMM' }}. Order number {{ o.id }}.</p>
        </div>
        <div class="grid md:grid-cols-2 gap-3 mt-3">
          <section class="panel p-4"><h2 class="font-bold text-[16px] mb-1">Delivering to</h2>
            <p>{{ o.address.name }}, {{ o.address.phone }}<br />{{ o.address.line1 }}{{ o.address.line2 ? ', ' + o.address.line2 : '' }}<br />{{ o.address.city }}, {{ o.address.state }} {{ o.address.pincode }}</p>
            <h2 class="font-bold text-[16px] mt-3 mb-1">Payment</h2><p>{{ o.payment }}</p>
          </section>
          <section class="panel p-4"><h2 class="font-bold text-[16px] mb-2">Price details</h2><kd-price-breakdown [totals]="o.totals" /></section>
        </div>
        <ul class="panel mt-3 divide-y divide-cream-deep px-4">
          @for (l of o.lines; track l.productId) {
            <li class="flex items-center gap-3 py-2.5">
              <img kdImg [src]="l.thumb" [alt]="l.title" class="w-14 h-14 object-contain shrink-0" />
              <a [routerLink]="['/product', l.slug]" class="flex-1 min-w-0 font-medium hover:text-forest-soft">{{ l.title }} <span class="text-ink-soft font-normal">× {{ l.qty }}</span></a>
              <span class="font-semibold tabular-nums">{{ l.price * l.qty | inr }}</span>
            </li>
          }
        </ul>
        <div class="flex flex-wrap gap-2 mt-4">
          <a routerLink="/account/orders" class="btn btn-primary">View your orders</a>
          <a routerLink="/shop" class="btn btn-outline">Continue shopping</a>
        </div>
      } @else {
        <kd-empty title="Order not found" text="This order isn't linked to the account you're signed in with.">
          <a routerLink="/account/orders" class="btn btn-primary">View your orders</a>
        </kd-empty>
      }
    </div>`,
})
export class OrderConfirmationPage {
  id = input.required<string>();
  private orders = inject(OrderService);
  order = computed(() => this.orders.get(this.id()));
}

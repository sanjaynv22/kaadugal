import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PriceBreakdown } from '../components/order-summary';
import { ProductRail } from '../components/product-rail';
import { EmptyState, ImgFallback, InrPipe, QtyStepper } from '../components/ui';
import { CartService, FREE_DELIVERY_FROM } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';
import { ToastService } from '../services/toast.service';
import { WishlistService } from '../services/wishlist.service';

@Component({
  selector: 'kd-cart',
  imports: [RouterLink, PriceBreakdown, ProductRail, EmptyState, ImgFallback, InrPipe, QtyStepper],
  template: `
    <div class="page py-4">
      <h1 class="text-[24px] font-bold mb-3">Your cart</h1>
      @if (cart.items().length) {
        <div class="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-4 items-start">
          <ul class="panel divide-y divide-cream-deep">
            @for (i of cart.items(); track i.product.id) {
              <li class="flex gap-3 sm:gap-4 p-3 sm:p-4">
                <a [routerLink]="['/product', i.product.slug]" class="shrink-0 w-24 h-24 sm:w-32 sm:h-32"><img kdImg [src]="i.product.thumb" [alt]="i.product.title" class="w-full h-full object-contain" /></a>
                <div class="flex-1 min-w-0">
                  <div class="flex flex-wrap justify-between gap-x-4">
                    <a [routerLink]="['/product', i.product.slug]" class="font-semibold text-[15px] hover:text-forest-soft min-w-0">{{ i.product.title }}</a>
                    <span class="font-bold text-[16px] tabular-nums">{{ i.product.price * i.qty | inr }}</span>
                  </div>
                  <p class="text-[13px] text-ink-soft">{{ i.product.brand }}</p>
                  <p class="text-[13px] mt-0.5"><span class="tabular-nums">{{ i.product.price | inr }} each</span> <span class="text-ink-soft line-through ml-1 tabular-nums">{{ i.product.mrp | inr }}</span> <span class="text-sale font-semibold ml-1">{{ i.product.disc }}% off</span></p>
                  <p class="text-[13px]" [class]="i.qty > i.product.stock ? 'text-sale font-semibold' : i.product.stock < 10 ? 'text-[#8A5A00]' : 'text-forest-soft'">{{ i.product.stock === 0 ? 'Out of stock. Remove it to check out.' : i.qty > i.product.stock ? 'Only ' + i.product.stock + ' left. Lower the quantity to check out.' : i.product.stock < 10 ? 'Only ' + i.product.stock + ' left' : 'In stock' }}</p>
                  <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                    <kd-qty [value]="i.qty" [max]="max(i.qty, cart.limit(i.product.id))" (change)="cart.setQty(i.product.id, $event)" />
                    <button type="button" class="link text-[13px] py-1" (click)="remove(i.product.id)" [attr.aria-label]="'Remove ' + i.product.title">Remove</button>
                    <button type="button" class="link text-[13px] py-1" (click)="saveForLater(i.product.id)">Move to wishlist</button>
                  </div>
                </div>
              </li>
            }
          </ul>
          <aside class="panel p-4 lg:sticky lg:top-3" aria-label="Price details">
            <h2 class="text-lg font-bold mb-2">Price details</h2>
            <kd-price-breakdown [totals]="cart.totals()" />
            @if (toFree() > 0) { <p class="text-[13px] mt-2 text-[#8A5A00]">Add {{ toFree() | inr }} more for free delivery.</p> }
            @else { <p class="text-[13px] mt-2 text-forest-soft font-semibold">You save {{ cart.totals().discount | inr }} on this order.</p> }
            @if (cart.unavailable().length) {
              <p class="field-error mt-3" role="alert">Fix the items marked above to check out.</p>
            } @else {
              <a routerLink="/checkout" class="btn btn-primary w-full mt-3">Proceed to checkout</a>
            }
          </aside>
        </div>
      } @else {
        <kd-empty title="Your cart is empty" text="Add items from today's offers or browse by category.">
          <a routerLink="/shop" [queryParams]="{ deals: 1 }" class="btn btn-primary">See today's offers</a>
        </kd-empty>
      }
      <kd-rail title="You might also like" [products]="suggestions()" />
    </div>`,
})
export class CartPage {
  cart = inject(CartService);
  private catalog = inject(CatalogService);
  private wishlist = inject(WishlistService);
  private toast = inject(ToastService);
  max = Math.max;
  toFree = computed(() => FREE_DELIVERY_FROM - this.cart.totals().subtotal);
  suggestions = computed(() => this.catalog.recommended(this.cart.items().map((i) => i.product.id), 10));
  remove(id: number) {
    const name = this.catalog.get(id)?.title;
    this.cart.remove(id);
    this.toast.show({ text: 'Removed from cart: ' + name });
  }
  saveForLater(id: number) {
    if (!this.wishlist.has(id)) this.wishlist.toggle(id);
    this.cart.remove(id);
    this.toast.show({ text: 'Moved to wishlist', link: '/wishlist', linkText: 'View wishlist' });
  }
}

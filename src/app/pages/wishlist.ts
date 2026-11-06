import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductCard } from '../components/product-card';
import { EmptyState } from '../components/ui';
import { WishlistService } from '../services/wishlist.service';

@Component({
  selector: 'kd-wishlist',
  imports: [RouterLink, ProductCard, EmptyState],
  host: { class: 'block' },
  template: `
    <div [class]="embedded ? '' : 'page py-4'">
      <h1 class="text-[24px] font-bold mb-3">Wishlist</h1>
      @if (wishlist.products().length) {
        <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5">
          @for (p of wishlist.products(); track p.id) { <li class="min-w-0"><kd-product-card [product]="p" /></li> }
        </ul>
      } @else {
        <kd-empty title="Your wishlist is empty" text="Tap the heart on any product to save it here.">
          <a routerLink="/shop" class="btn btn-primary">Browse products</a>
        </kd-empty>
      }
    </div>`,
})
export class WishlistPage {
  wishlist = inject(WishlistService);
  embedded = location.pathname.startsWith('/account');
}

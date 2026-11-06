import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../models';
import { CartService } from '../services/cart.service';
import { ToastService } from '../services/toast.service';
import { WishlistService } from '../services/wishlist.service';
import { ImgFallback, InrPipe, QtyStepper, Stars } from './ui';

@Component({
  selector: 'kd-product-card',
  imports: [RouterLink, Stars, InrPipe, ImgFallback, QtyStepper],
  host: { class: 'block h-full' },
  template: `
    @let p = product();
    <article class="panel relative h-full flex flex-col overflow-hidden hover:border-sage transition-colors">
      <a [routerLink]="['/product', p.slug]" class="block relative bg-white aspect-square p-3" [attr.aria-label]="p.title">
        <img kdImg [src]="p.thumb" [alt]="p.title" loading="lazy" class="w-full h-full object-contain" [class.opacity-50]="p.stock === 0" />
        @if (p.stock === 0) {
          <span class="absolute left-0 top-2.5 bg-ink text-white text-[11px] font-semibold px-2 py-0.5 rounded-r">Out of stock</span>
        }
      </a>
      <button type="button" (click)="toggleWish()" [attr.aria-pressed]="wished()"
        [attr.aria-label]="(wished() ? 'Remove ' : 'Add ') + p.title + (wished() ? ' from wishlist' : ' to wishlist')"
        class="absolute right-1.5 top-1.5 w-9 h-9 rounded-full grid place-items-center bg-white/90 hover:bg-cream-deep">
        <svg viewBox="0 0 24 24" class="w-[19px] h-[19px]" [attr.fill]="wished() ? '#B3361F' : 'none'" [attr.stroke]="wished() ? '#B3361F' : '#252A27'" stroke-width="1.8" aria-hidden="true"><path d="M12 20.5s-8-4.9-8-11A4.5 4.5 0 0 1 12 6.6 4.5 4.5 0 0 1 20 9.500c0 6.100-8 11-8 11z"/></svg>
      </button>
      <div class="flex flex-col flex-1 px-3 pb-3 pt-1 border-t border-cream-deep">
        <div class="flex items-center justify-between gap-1.5 mt-1.5 min-h-[18px]">
          <span class="text-[11.5px] text-ink-soft truncate">{{ p.brand }}</span>
          @if (p.label && p.stock > 0) { <span class="shrink-0 text-[10.5px] font-semibold px-1.5 py-px rounded-sm" [class]="labelClass()">{{ p.label }}</span> }
        </div>
        <a [routerLink]="['/product', p.slug]" class="font-medium leading-snug line-clamp-2 min-h-[2.5em] hover:text-forest-soft">{{ p.title }}</a>
        <kd-stars class="mt-1" [value]="p.rating" [count]="p.ratingCount" />
        <div class="mt-1.5 flex flex-wrap items-baseline gap-x-1.5">
          <span class="text-[17px] font-bold tabular-nums">{{ p.price | inr }}</span>
          <span class="text-xs text-ink-soft line-through tabular-nums">{{ p.mrp | inr }}</span>
          <span class="text-xs font-semibold text-sale">{{ p.disc }}% off</span>
        </div>
        <div class="mt-auto pt-2.5">
          @if (qty() > 0) {
            <div class="flex items-center justify-between gap-1">
              <kd-qty [value]="qty()" [min]="0" [max]="cart.limit(p.id)" (change)="cart.setQty(p.id, $event)" />
              <span class="text-xs text-forest-soft font-semibold">In cart</span>
            </div>
          } @else {
            <button type="button" class="btn btn-outline w-full !py-1.5" [disabled]="p.stock === 0" [class.opacity-50]="p.stock === 0" (click)="add()">
              {{ p.stock === 0 ? 'Unavailable' : 'Add to cart' }}
            </button>
          }
        </div>
      </div>
    </article>`,
})
export class ProductCard {
  product = input.required<Product>();
  cart = inject(CartService);
  private wishlist = inject(WishlistService);
  private toast = inject(ToastService);

  qty = computed(() => this.cart.qty(this.product().id));
  wished = computed(() => this.wishlist.ids().includes(this.product().id));
  labelClass = computed(() => {
    switch (this.product().label) {
      case 'Limited deal': return 'bg-sale text-white';
      case 'Best seller': return 'bg-forest text-white';
      case 'Almost gone': return 'bg-[#F4E2C4] text-[#6B4A0B]';
      default: return 'bg-sage-soft text-forest';
    }
  });

  add() {
    this.cart.add(this.product().id);
    this.toast.show({ text: 'Added to cart: ' + this.product().title, link: '/cart', linkText: 'View cart' });
  }
  toggleWish() {
    const added = this.wishlist.toggle(this.product().id);
    this.toast.show(added ? { text: 'Added to wishlist', link: '/wishlist', linkText: 'View wishlist' } : { text: 'Removed from wishlist' });
  }
}

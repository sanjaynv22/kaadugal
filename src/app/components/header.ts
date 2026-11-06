import { Component, ElementRef, HostListener, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { CITIES } from '../data/categories';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';
import { ShopperService } from '../services/shopper.service';
import { WishlistService } from '../services/wishlist.service';
import { ImgFallback, InrPipe, Logo } from './ui';

@Component({
  selector: 'kd-header',
  imports: [RouterLink, FormsModule, Logo, InrPipe, ImgFallback],
  template: `
    <header class="on-dark bg-forest text-white">
      <div class="page flex flex-wrap items-center gap-x-2 lg:gap-x-4 gap-y-2 py-2">
        <a routerLink="/" class="shrink-0 px-1 py-1" aria-label="KAADUGAL home"><kd-logo /></a>

        <button type="button" (click)="locOpen.set(true)" class="hidden lg:flex items-center gap-1.5 text-left px-1.5 py-1 rounded hover:bg-forest-soft shrink-0">
          <svg viewBox="0 0 24 24" class="w-4 h-4 fill-none stroke-current" stroke-width="2" aria-hidden="true"><path d="M12 21s7-6.100 7-11.500A7 7 0 0 0 5 9.500C5 14.900 12 21 12 21z"/><circle cx="12" cy="9.500" r="2.400"/></svg>
          <span class="leading-tight"><span class="block text-[11px] text-sage">Deliver to</span>
            <span class="block font-semibold text-[13px]">{{ locText() }}</span></span>
        </button>

        <form role="search" (submit)="$event.preventDefault(); submit()" class="search order-last lg:order-none basis-full lg:basis-0 lg:flex-1 relative">
          <div class="flex rounded overflow-hidden bg-white h-10 focus-within:outline-2 focus-within:outline-sage">
            <label class="sr-only" for="search-cat">Search in category</label>
            <select id="search-cat" name="cat" [(ngModel)]="searchCat" class="bg-cream-deep text-ink text-[13px] pl-2 pr-1 max-w-[86px] sm:max-w-[150px] border-r border-line outline-none">
              <option value="">All</option>
              @for (c of catalog.categories; track c.slug) { <option [value]="c.slug">{{ c.short }}</option> }
            </select>
            <label class="sr-only" for="search-q">Search products</label>
            <input id="search-q" name="q" type="search" autocomplete="off" placeholder="Search products, brands and more" [ngModel]="term()" (ngModelChange)="term.set($event); suggestOpen.set(true)" (focus)="suggestOpen.set(true)" (keydown.escape)="suggestOpen.set(false)"
              class="flex-1 min-w-0 text-ink px-3 outline-none placeholder:text-ink-soft" />
            <button class="bg-sage hover:bg-sage-soft text-forest px-4 grid place-items-center" aria-label="Search">
              <svg viewBox="0 0 24 24" class="w-5 h-5 fill-none stroke-current" stroke-width="2.4" aria-hidden="true"><circle cx="11" cy="11" r="6.500"/><path d="M16 16l5 5"/></svg>
            </button>
          </div>
          @if (suggestOpen() && suggestions().length) {
            <ul class="absolute z-40 left-0 right-0 mt-1 bg-white text-ink rounded border border-line shadow-lg overflow-hidden">
              @for (p of suggestions(); track p.id) {
                <li>
                  <a [routerLink]="['/product', p.slug]" (click)="suggestOpen.set(false)" class="flex items-center gap-3 px-3 py-2 hover:bg-cream">
                    <img kdImg [src]="p.thumb" [alt]="p.title" class="w-9 h-9 object-contain shrink-0" />
                    <span class="flex-1 truncate">{{ p.title }}</span>
                    <span class="font-semibold tabular-nums">{{ p.price | inr }}</span>
                  </a>
                </li>
              }
            </ul>
          }
        </form>

        <nav class="ml-auto flex items-center gap-0.5 lg:gap-1" aria-label="Account">
          @if (auth.loggedIn()) {
            <a routerLink="/account" class="h-link flex"><span class="hidden sm:block text-[11px] text-sage">Hello, {{ auth.firstName() }}</span><span class="font-semibold text-[13px]">Account</span></a>
          } @else {
            <a routerLink="/login" class="h-link flex"><span class="hidden sm:block text-[11px] text-sage">Account</span><span class="font-semibold text-[13px]">Sign in</span></a>
          }
          <a routerLink="/account/orders" class="h-link hidden sm:flex"><span class="text-[11px] text-sage">Returns &</span><span class="font-semibold text-[13px]">Orders</span></a>
          <a routerLink="/wishlist" class="h-icon relative" [attr.aria-label]="'Wishlist, ' + wishlist.count() + ' items'">
            <svg viewBox="0 0 24 24" class="w-6 h-6 fill-none stroke-current" stroke-width="1.8" aria-hidden="true"><path d="M12 20.500s-8-4.900-8-11A4.500 4.500 0 0 1 12 6.600 4.500 4.500 0 0 1 20 9.500c0 6.100-8 11-8 11z"/></svg>
            @if (wishlist.count()) { <span class="badge">{{ wishlist.count() }}</span> }
            <span class="hidden xl:inline font-semibold text-[13px]">Wishlist</span>
          </a>
          <a routerLink="/cart" class="h-icon relative" [attr.aria-label]="'Cart, ' + cart.count() + ' items'">
            <svg viewBox="0 0 24 24" class="w-6 h-6 fill-none stroke-current" stroke-width="1.8" aria-hidden="true"><path d="M3 4h2.500l2.300 11h10.400l2-8H6.500"/><circle cx="9.500" cy="19.500" r="1.500"/><circle cx="17" cy="19.500" r="1.500"/></svg>
            @if (cart.count()) { <span class="badge">{{ cart.count() }}</span> }
            <span class="hidden xl:inline font-semibold text-[13px]">Cart</span>
          </a>
        </nav>
      </div>

      <nav class="bg-forest-deep" aria-label="Product categories">
        <div class="page flex items-center gap-1 overflow-x-auto no-scrollbar text-[13px] h-9">
          <button type="button" (click)="locOpen.set(true)" class="lg:hidden shrink-0 px-2 py-1 rounded hover:bg-forest-soft text-sage-soft">{{ shopper.location() ? 'Deliver to ' + locText() : 'Select delivery location' }}</button>
          <a routerLink="/shop" [queryParams]="{ deals: 1 }" class="shrink-0 px-2 py-1 rounded font-semibold text-[#F4D9A0] hover:bg-forest-soft">Today's offers</a>
          @for (c of catalog.categories; track c.slug) {
            <a routerLink="/shop" [queryParams]="{ cat: c.slug }" class="shrink-0 px-2 py-1 rounded hover:bg-forest-soft whitespace-nowrap">{{ c.short }}</a>
          }
        </div>
      </nav>
    </header>

    @if (locOpen()) {
      <div class="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" (click)="locOpen.set(false)">
        <div role="dialog" aria-modal="true" aria-labelledby="loc-title" class="bg-white text-ink rounded-lg p-5 w-full max-w-md" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between">
            <h2 id="loc-title" class="text-lg font-bold">Choose your delivery location</h2>
            <button type="button" (click)="locOpen.set(false)" class="w-8 h-8 -mt-1 -mr-1 text-xl rounded hover:bg-cream-deep" aria-label="Close">×</button>
          </div>
          <p class="text-ink-soft mb-3">Delivery dates are shown for this location.</p>
          <form class="flex gap-2 items-start" (submit)="$event.preventDefault(); savePin()">
            <div class="flex-1">
              <label class="sr-only" for="pin">6-digit pincode</label>
              <input id="pin" name="pin" class="field" [class.invalid]="pinError()" inputmode="numeric" maxlength="6" placeholder="Enter 6-digit pincode" [(ngModel)]="pin" />
              @if (pinError()) { <p class="field-error">{{ pinError() }}</p> }
            </div>
            <button class="btn btn-primary">Apply</button>
          </form>
          <div class="flex flex-wrap gap-1.5 mt-4">
            @for (c of cities; track c.city) {
              <button type="button" class="px-3 py-1.5 rounded-full border border-line hover:bg-cream-deep text-[13px]" (click)="setCity(c)">{{ c.city }}</button>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: `
    .h-link { flex-direction: column; justify-content: center; padding: .25rem .4rem; border-radius: 4px; line-height: 1.15; min-height: 40px; }
    .h-icon { display: flex; align-items: center; gap: .35rem; padding: .25rem .4rem; border-radius: 4px; min-height: 40px; }
    .h-link:hover, .h-icon:hover { background: var(--color-forest-soft); }
    .badge { position: absolute; left: 20px; top: 1px; min-width: 17px; height: 17px; padding: 0 4px; border-radius: 9px; background: #F4D9A0; color: var(--color-forest-deep); font-size: 11px; font-weight: 700; line-height: 17px; text-align: center; }
  `,
})
export class Header {
  catalog = inject(CatalogService);
  cart = inject(CartService);
  wishlist = inject(WishlistService);
  auth = inject(AuthService);
  shopper = inject(ShopperService);
  private router = inject(Router);
  private host = inject(ElementRef<HTMLElement>);

  cities = CITIES;
  locOpen = signal(false);
  pin = '';
  pinError = signal('');
  searchCat = '';
  term = signal('');
  suggestOpen = signal(false);

  locText = computed(() => {
    const l = this.shopper.location();
    return l ? (l.city ? `${l.city} ${l.pincode}` : l.pincode) : 'Select location';
  });
  suggestions = computed(() => (this.term().trim().length < 2 ? [] : this.catalog.search(this.term()).slice(0, 6)));

  constructor() {
    this.router.events.subscribe((e) => {
      if (!(e instanceof NavigationEnd)) return;
      this.suggestOpen.set(false);
      const params = this.router.parseUrl(e.urlAfterRedirects).queryParams;
      if (e.urlAfterRedirects.startsWith('/shop')) {
        this.term.set(params['q'] ?? '');
        this.searchCat = params['q'] ? (params['cat'] ?? '') : '';
      }
    });
  }

  @HostListener('document:click', ['$event'])
  outside(e: Event) {
    if (!(e.target as HTMLElement).closest?.('.search')) this.suggestOpen.set(false);
  }

  submit() {
    this.suggestOpen.set(false);
    const q = this.term().trim();
    this.router.navigate(['/shop'], { queryParams: { q: q || null, cat: this.searchCat || null } });
  }

  savePin() {
    if (!/^[1-9]\d{5}$/.test(this.pin.trim())) {
      this.pinError.set('Enter a valid 6-digit pincode, for example 600001.');
      return;
    }
    this.pinError.set('');
    this.setCity({ city: '', pincode: this.pin.trim() });
  }
  setCity(c: { city: string; pincode: string }) {
    this.shopper.setLocation(c);
    this.locOpen.set(false);
  }
}

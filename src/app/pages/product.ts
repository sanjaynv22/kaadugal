import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router, RouterLink } from '@angular/router';
import { ProductRail } from '../components/product-rail';
import { EmptyState, ImgFallback, InrPipe, QtyStepper, Stars } from '../components/ui';
import { CartService, FREE_DELIVERY_FROM } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';
import { ShopperService } from '../services/shopper.service';
import { ToastService } from '../services/toast.service';
import { WishlistService } from '../services/wishlist.service';

@Component({
  selector: 'kd-product',
  imports: [RouterLink, DatePipe, ProductRail, Stars, InrPipe, ImgFallback, QtyStepper, EmptyState],
  template: `
    <div class="page py-4">
      @if (product(); as p) {
        <nav class="text-[13px] text-ink-soft mb-3 flex flex-wrap gap-1.5" aria-label="Breadcrumb">
          <a routerLink="/" class="hover:underline">Home</a><span aria-hidden="true">/</span>
          <a routerLink="/shop" [queryParams]="{ cat: p.category }" class="hover:underline">{{ catName() }}</a><span aria-hidden="true">/</span>
          <span class="text-ink truncate max-w-[60vw]">{{ p.title }}</span>
        </nav>

        <div class="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)_300px] gap-4 items-start">
          <section class="flex flex-col-reverse sm:flex-row gap-2.5 lg:sticky lg:top-3" aria-label="Product images">
            <ul class="flex sm:flex-col gap-2 overflow-x-auto no-scrollbar shrink-0">
              @for (src of p.images; track src; let i = $index) {
                <li><button type="button" class="block w-16 h-16 bg-white rounded border-2 p-1" [class]="i === imageIndex() ? 'border-forest' : 'border-line hover:border-sage'" (click)="imageIndex.set(i)" (mouseenter)="imageIndex.set(i)" [attr.aria-label]="'Show image ' + (i + 1)" [attr.aria-current]="i === imageIndex()">
                  <img kdImg [src]="src" [alt]="p.title" class="w-full h-full object-contain" /></button></li>
              }
            </ul>
            <div class="panel flex-1 p-4 aspect-square min-w-0">
              <img kdImg [src]="p.images[imageIndex()] || p.thumb" [alt]="p.title" class="w-full h-full object-contain" />
            </div>
          </section>

          <section class="min-w-0">
            <a routerLink="/shop" [queryParams]="{ brand: p.brand }" class="link text-[13px]">{{ p.brand }}</a>
            <h1 class="text-[24px] font-bold leading-tight mt-0.5">{{ p.title }}</h1>
            <div class="mt-1.5 flex items-center gap-2">
              <kd-stars [value]="p.rating" [count]="p.ratingCount" />
              @if (p.label) { <span class="text-[11px] font-semibold bg-sage-soft text-forest px-1.5 py-0.5 rounded">{{ p.label }}</span> }
            </div>
            <hr class="border-line my-3" />
            <div class="flex flex-wrap items-baseline gap-x-2">
              <span class="text-[20px] font-medium text-sale">-{{ p.disc }}%</span>
              <span class="text-[30px] font-bold tabular-nums leading-none">{{ p.price | inr }}</span>
            </div>
            <p class="text-[13px] text-ink-soft mt-0.5">MRP <span class="line-through">{{ p.mrp | inr }}</span>, inclusive of all taxes. You save {{ p.mrp - p.price | inr }}.</p>
            <h2 class="text-[16px] font-bold mt-4 mb-1">About this item</h2>
            <p class="max-w-[64ch]">{{ p.description }}</p>
            <ul class="mt-3 flex flex-wrap gap-2 text-[12.5px]">
              <li class="panel px-2.5 py-1.5">{{ p.returns }}</li>
              @if (p.warranty !== 'Not applicable') { <li class="panel px-2.5 py-1.5">{{ p.warranty }}</li> }
              <li class="panel px-2.5 py-1.5">{{ p.shipping }}</li>
            </ul>
          </section>

          <aside class="panel p-4 lg:sticky lg:top-3" aria-label="Buy this item">
            <p class="text-[24px] font-bold tabular-nums">{{ p.price | inr }}</p>
            <p class="text-[13px] mt-1">
              @if (p.price >= freeFrom) { <span class="font-semibold">Free delivery</span> } @else { ₹49 delivery, free from {{ freeFrom | inr }} }
              by {{ deliveryDate() | date: 'EEE, d MMM' }}
              @if (shopper.location(); as l) { to {{ l.city || l.pincode }} }
            </p>
            <p class="mt-2 font-semibold" [class]="p.stock === 0 ? 'text-sale' : p.stock < 10 ? 'text-[#8A5A00]' : 'text-forest-soft'">
              {{ p.stock === 0 ? 'Out of stock' : p.stock < 10 ? 'Only ' + p.stock + ' left in stock' : 'In stock' }}
            </p>
            @if (p.stock > 0) {
              <div class="flex items-center gap-2 mt-3"><span class="font-medium">Quantity</span>
                <kd-qty [value]="qty()" [max]="maxQty()" (change)="qty.set($event)" /></div>
              <button type="button" class="btn btn-outline w-full mt-3" (click)="addToCart()">Add to cart</button>
              <button type="button" class="btn btn-primary w-full mt-2" (click)="buyNow()">Buy now</button>
            }
            <button type="button" class="w-full mt-2 py-1.5 font-medium hover:underline" [attr.aria-pressed]="wished()" (click)="toggleWish()">
              {{ wished() ? '♥ Saved to wishlist' : '♡ Add to wishlist' }}
            </button>
            @if (inCart() > 0) { <p class="text-[13px] mt-1 text-center"><a routerLink="/cart" class="link">{{ inCart() }} already in your cart</a></p> }
          </aside>
        </div>

        <div class="grid lg:grid-cols-2 gap-4 mt-6">
          <section class="panel p-4">
            <h2 class="text-lg font-bold mb-2">Specifications</h2>
            <table class="w-full text-left">
              <tbody>
                @for (s of specs(); track s[0]) {
                  <tr class="border-t border-cream-deep first:border-0"><th scope="row" class="font-medium text-ink-soft py-1.5 pr-3 w-[38%] align-top">{{ s[0] }}</th><td class="py-1.5">{{ s[1] }}</td></tr>
                }
              </tbody>
            </table>
          </section>
          <section class="panel p-4">
            <h2 class="text-lg font-bold mb-2">Customer reviews</h2>
            <ul class="space-y-3">
              @for (r of p.reviews; track r.name + r.comment) {
                <li class="border-t border-cream-deep pt-2.5 first:border-0 first:pt-0">
                  <div class="flex items-center gap-2"><kd-stars [value]="r.rating" /><span class="font-semibold">{{ r.name }}</span></div>
                  <p class="mt-0.5">{{ r.comment }}</p>
                  <p class="text-xs text-ink-soft">{{ r.date | date: 'd MMM y' }}</p>
                </li>
              }
            </ul>
          </section>
        </div>

        <kd-rail title="Related products" [products]="related()" link="/shop" [linkParams]="{ cat: p.category }" />
      } @else {
        <kd-empty title="This product isn't available" text="It may have been removed. Browse similar items in the store.">
          <a routerLink="/shop" class="btn btn-primary">Browse all products</a>
        </kd-empty>
      }
    </div>`,
})
export class ProductPage {
  slug = input.required<string>();
  private catalog = inject(CatalogService);
  private cart = inject(CartService);
  private wishlist = inject(WishlistService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private titleService = inject(Title);
  shopper = inject(ShopperService);
  freeFrom = FREE_DELIVERY_FROM;

  product = computed(() => this.catalog.getBySlug(this.slug()));
  catName = computed(() => this.catalog.category(this.product()?.category)?.name);
  related = computed(() => { const p = this.product(); return p ? this.catalog.related(p) : []; });
  maxQty = computed(() => { const p = this.product(); return p ? this.cart.limit(p.id) : 1; });
  inCart = computed(() => { const p = this.product(); return p ? this.cart.qty(p.id) : 0; });
  wished = computed(() => this.wishlist.ids().includes(this.product()?.id ?? -1));
  deliveryDate = computed(() => new Date(Date.now() + 3 * 864e5));
  specs = computed(() => {
    const p = this.product()!;
    return [['Brand', p.brand], ...Object.entries(p.extra ?? {}), ['Category', this.catName() ?? ''], ['Item code', p.sku], ...(p.warranty === 'Not applicable' ? [] : [['Warranty', p.warranty]]), ['Returns', p.returns], ['Shipping', p.shipping]];
  });
  imageIndex = signal(0);
  qty = signal(1);

  constructor() {
    effect(() => {
      const p = this.product();
      untracked(() => {
        this.imageIndex.set(0);
        this.qty.set(1);
        if (p) {
          this.shopper.viewed(p.id);
          this.titleService.setTitle(p.title + ' | KAADUGAL');
        }
      });
    });
  }

  addToCart() {
    const p = this.product()!;
    this.cart.add(p.id, this.qty());
    this.toast.show({ text: 'Added to cart: ' + p.title, link: '/cart', linkText: 'View cart' });
  }
  buyNow() {
    const p = this.product()!;
    this.router.navigate(['/checkout'], { queryParams: { buy: p.id, qty: this.qty() } });
  }
  toggleWish() {
    const added = this.wishlist.toggle(this.product()!.id);
    this.toast.show(added ? { text: 'Added to wishlist', link: '/wishlist', linkText: 'View wishlist' } : { text: 'Removed from wishlist' });
  }
}

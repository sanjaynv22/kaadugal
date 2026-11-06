import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Countdown } from '../components/countdown';
import { ProductRail } from '../components/product-rail';
import { ImgFallback } from '../components/ui';
import { FEATURED_BRANDS } from '../data/categories';
import { Product } from '../models';
import { CatalogService } from '../services/catalog.service';
import { ShopperService } from '../services/shopper.service';
import { WishlistService } from '../services/wishlist.service';

interface Banner { title: string; text: string; cta: string; params: Record<string, string>; ids: number[]; bg: string; ink: string; ridge: string; ctaClass: string; }

@Component({
  selector: 'kd-home',
  imports: [RouterLink, ProductRail, Countdown, ImgFallback],
  template: `
    <section class="relative overflow-hidden" aria-roledescription="carousel" aria-label="Offers" (mouseenter)="paused.set(true)" (mouseleave)="paused.set(false)" (focusin)="paused.set(true)" (focusout)="paused.set(false)">
      @let b = banners[slide()];
      <div class="relative transition-colors duration-300" [style.background]="b.bg" [style.color]="b.ink">
        <div class="page relative z-10 grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-center gap-3 md:gap-6 min-h-[340px] md:min-h-[380px] pt-7 pb-14 md:py-8">
          <div class="max-w-[30rem] md:pl-10">
            <h1 class="font-display font-extrabold text-[32px] sm:text-[42px] lg:text-[52px] leading-[1.02]">{{ b.title }}</h1>
            <p class="mt-3 text-[15px] sm:text-[16px] max-w-[38ch]">{{ b.text }}</p>
            <a routerLink="/shop" [queryParams]="b.params" class="btn mt-4 !px-5 !py-2.5" [class]="b.ctaClass">{{ b.cta }}</a>
          </div>
          <div class="grid grid-cols-3 gap-2 sm:gap-3 md:pr-10">
            @for (id of b.ids; track id; let i = $index) {
              @if (catalog.get(id); as p) {
                <a [routerLink]="['/product', p.slug]" class="block bg-white rounded-md p-2 sm:p-3 aspect-[4/5]" [class.md:-translate-y-3]="i === 1">
                  <img kdImg [src]="p.images[0]" [alt]="p.title" class="w-full h-full object-contain" />
                </a>
              }
            }
          </div>
        </div>
        <svg class="absolute bottom-0 left-0 w-full h-16 md:h-24 pointer-events-none" viewBox="0 0 1440 96" preserveAspectRatio="none" aria-hidden="true">
          <path [attr.fill]="b.ridge" opacity=".55" d="M0 96V56L37 16L84 58L125 15L170 66L218 32L267 56L326 19L364 64L401 28L453 63L500 17L545 62L595 30L632 66L666 18L708 67L738 13L792 57L827 16L858 60L912 34L968 69L1006 19L1055 67L1114 22L1166 68L1225 21L1267 67L1322 16L1366 70L1400 23L1433 56L1440 19V96z"/>
          <path fill="#F7F5EF" d="M0 96V84L33 68L89 90L119 70L167 84L195 71L228 87L266 63L292 91L333 66L371 91L415 70L469 90L497 66L530 84L578 69L620 90L661 67L710 85L757 69L786 85L824 64L876 90L905 63L932 89L965 62L993 91L1047 63L1089 87L1133 71L1178 85L1221 73L1262 87L1292 64L1332 91L1367 65L1404 90L1434 71L1440 85V96z"/>
        </svg>
      </div>
      <button type="button" (click)="go(-1)" class="hero-arrow left-2" aria-label="Previous offer">‹</button>
      <button type="button" (click)="go(1)" class="hero-arrow right-2" aria-label="Next offer">›</button>
      <div class="absolute z-20 bottom-3 inset-x-0 flex justify-center gap-0.5">
        @for (x of banners; track x.title; let i = $index) {
          <button type="button" (click)="slide.set(i)" class="p-1.5 group" [attr.aria-label]="'Show offer ' + (i + 1)" [attr.aria-current]="i === slide()">
            <span class="block h-1.5 rounded-full transition-all" [class]="i === slide() ? 'w-7 bg-forest' : 'w-3.5 bg-sage'"></span>
          </button>
        }
      </div>
    </section>

    <div class="page">
      <section class="mt-5" aria-labelledby="cats">
        <h2 id="cats" class="text-xl font-bold mb-2.5">Shop by category</h2>
        <ul class="grid grid-cols-5 lg:grid-cols-10 gap-x-2 gap-y-3 max-sm:grid-cols-4">
          @for (c of catalog.categories; track c.slug) {
            <li>
              <a routerLink="/shop" [queryParams]="{ cat: c.slug }" class="group block text-center">
                <span class="block bg-white border border-line rounded-md p-2 aspect-square group-hover:border-forest transition-colors">
                  <img kdImg [src]="c.image" [alt]="" loading="lazy" class="w-full h-full object-contain" />
                </span>
                <span class="block mt-1.5 text-[12.5px] sm:text-[13px] font-medium leading-tight group-hover:text-forest-soft">{{ c.short }}</span>
              </a>
            </li>
          }
        </ul>
      </section>

      <kd-rail title="Today's deals" [products]="deals" link="/shop" [linkParams]="{ deals: '1' }"><kd-countdown /></kd-rail>

      <section class="mt-6 grid md:grid-cols-3 gap-2.5" aria-label="Promotions">
        @for (p of promos; track p.title) {
          <a routerLink="/shop" [queryParams]="p.params" class="relative flex items-center gap-3 rounded-md overflow-hidden min-h-[132px] pl-5 pr-2 hover:opacity-95" [style.background]="p.bg" [style.color]="p.ink">
            <span class="flex-1 min-w-0 py-4">
              <span class="block font-display font-bold text-[21px] leading-tight">{{ p.title }}</span>
              <span class="block mt-1 text-[13px]">{{ p.text }}</span>
            </span>
            <span class="shrink-0 w-[108px] h-[108px] bg-white rounded p-1.5"><img kdImg [src]="p.image" alt="" loading="lazy" class="w-full h-full object-contain" /></span>
          </a>
        }
      </section>

      <kd-rail title="Best sellers" [products]="best" link="/shop" [linkParams]="{ sort: 'popular' }" />
      <kd-rail title="Trending now" [products]="trending" link="/shop" [linkParams]="{ sort: 'newest' }" />

      <section class="mt-6 rounded-md bg-forest text-white flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 on-dark">
        <h2 class="text-[20px] font-bold">Free delivery on orders from ₹499</h2>
        <p class="text-sage-soft flex-1 min-w-[16rem]">Easy returns on most items, and pay on delivery where available.</p>
        <a routerLink="/info/help" class="btn bg-white text-forest hover:bg-cream-deep">How delivery works</a>
      </section>

      <kd-rail [title]="recentIds().length || wishIds().length ? 'Recommended for you' : 'Top picks to start with'" [products]="recommended()" />

      @if (recent().length) {
        <kd-rail title="Recently viewed" [products]="recent()" />
      }

      <section class="mt-6" aria-labelledby="brands">
        <h2 id="brands" class="text-xl font-bold mb-2.5">Featured brands</h2>
        <ul class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          @for (b of brands; track b) {
            <li><a routerLink="/shop" [queryParams]="{ brand: b }" class="grid place-items-center h-16 panel font-display font-bold text-[17px] text-forest hover:border-forest transition-colors text-center px-2">{{ b }}</a></li>
          }
        </ul>
      </section>
    </div>`,
  styles: `.hero-arrow { position: absolute; top: 45%; z-index: 20; width: 34px; height: 52px; display: none; font-size: 24px; background: rgba(255,255,255,.88); color: var(--color-forest); border-radius: 4px; } .hero-arrow:hover { background: #fff; } @media (min-width: 768px) { .hero-arrow { display: block; } }`,
})
export class HomePage {
  catalog = inject(CatalogService);
  private shopper = inject(ShopperService);
  private wishlist = inject(WishlistService);

  deals = this.catalog.deals();
  best = this.catalog.bestSellers();
  trending = this.catalog.trending();
  brands = FEATURED_BRANDS;
  recentIds = this.shopper.recent;
  wishIds = this.wishlist.ids;
  recent = computed(() => this.recentIds().map((id) => this.catalog.get(id)).filter((p): p is Product => !!p));
  recommended = computed(() => this.catalog.recommended([...this.recentIds().slice(0, 6), ...this.wishIds()]));

  private light = 'bg-forest text-white hover:bg-forest-soft';
  banners: Banner[] = [
    { title: 'Your next laptop, up to 20% off', text: 'Thin, fast machines from Apple, Asus, Lenovo and Dell, delivered free.', cta: 'Shop laptops', params: { q: 'laptop' }, ids: [78, 81, 79], bg: '#183D32', ink: '#fff', ridge: '#A8B5A0', ctaClass: 'bg-white text-forest hover:bg-cream-deep' },
    { title: 'Dress for the season ahead', text: 'New shirts, shoes and bags from labels you know and a few you will.', cta: 'Shop fashion', params: { cat: 'fashion' }, ids: [172, 90, 164], bg: '#DDE3D8', ink: '#252A27', ridge: '#A8B5A0', ctaClass: this.light },
    { title: 'A kitchen that keeps up', text: 'Cookware, blenders and everyday tools, from ₹199.', cta: 'Shop home and kitchen', params: { cat: 'home-kitchen' }, ids: [51, 66, 71], bg: '#EDE4CE', ink: '#252A27', ridge: '#A8B5A0', ctaClass: this.light },
    { title: 'Old games, new favourites', text: 'Carrom, pallanguzhi and bambaram, plus toys for every age.', cta: 'Shop toys and games', params: { cat: 'toys' }, ids: [1105, 1104, 1103], bg: '#102C24', ink: '#fff', ridge: '#24594A', ctaClass: 'bg-white text-forest hover:bg-cream-deep' },
  ];
  promos = [
    { title: 'Phones you can upgrade to', text: 'Oppo, Realme, Vivo and Samsung', params: { cat: 'mobiles' }, image: this.catalog.get(133)?.thumb ?? 'catalog/placeholder.svg', bg: '#DDE3D8', ink: '#252A27' },
    { title: 'Fresh fruit and pantry staples', text: 'Delivered in 1 to 3 days', params: { cat: 'grocery' }, image: this.catalog.get(40)?.thumb ?? 'catalog/placeholder.svg', bg: '#183D32', ink: '#fff' },
    { title: 'Fragrance worth gifting', text: 'Dior, Gucci, Chanel and more', params: { q: 'eau' }, image: this.catalog.get(8)?.thumb ?? 'catalog/placeholder.svg', bg: '#EDE4CE', ink: '#252A27' },
  ];

  slide = signal(0);
  paused = signal(false);

  constructor() {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!reduced) {
      const t = setInterval(() => { if (!this.paused()) this.go(1); }, 6000);
      inject(DestroyRef).onDestroy(() => clearInterval(t));
    }
  }
  go(d: number) { this.slide.update((s) => (s + d + this.banners.length) % this.banners.length); }
}

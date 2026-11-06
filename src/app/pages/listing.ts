import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ProductCard } from '../components/product-card';
import { EmptyState } from '../components/ui';
import { CatalogService, ProductQuery, SortKey } from '../services/catalog.service';

const PAGE_SIZE = 24;
const PRICE_RANGES = [
  { label: 'Under ₹500', max: 499 }, { label: '₹500 to ₹2,000', min: 500, max: 2000 },
  { label: '₹2,000 to ₹10,000', min: 2000, max: 10000 }, { label: '₹10,000 to ₹50,000', min: 10000, max: 50000 },
  { label: 'Over ₹50,000', min: 50000 },
];

@Component({
  selector: 'kd-listing',
  imports: [FormsModule, NgTemplateOutlet, ProductCard, EmptyState],
  template: `
    <div class="page py-4">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-2 mb-3">
        <div class="min-w-0 mr-auto">
          <h1 class="text-[22px] font-bold leading-tight">{{ heading() }}</h1>
          <p class="text-ink-soft text-[13px]" aria-live="polite">{{ results().length }} {{ results().length === 1 ? 'product' : 'products' }}</p>
        </div>
        <button type="button" class="btn btn-outline lg:hidden" (click)="filtersOpen.set(true)">Filters @if (activeCount()) { ({{ activeCount() }}) }</button>
        <label class="flex items-center gap-2 text-[13px]">
          <span class="whitespace-nowrap">Sort by</span>
          <select class="field !w-auto !py-1.5" [ngModel]="query().sort" (ngModelChange)="patch({ sort: $event === 'popular' ? null : $event })">
            <option value="popular">Popularity</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="newest">Newest</option>
            <option value="rating">Top rated</option>
          </select>
        </label>
      </div>

      @if (chips().length) {
        <ul class="flex flex-wrap gap-1.5 mb-3">
          @for (c of chips(); track c.label) {
            <li><button type="button" (click)="patch(c.clear)" class="inline-flex items-center gap-1.5 bg-sage-soft text-forest rounded-full pl-3 pr-2 py-1 text-[13px] font-medium hover:bg-sage" [attr.aria-label]="'Remove filter ' + c.label">{{ c.label }} <span aria-hidden="true">×</span></button></li>
          }
          <li><button type="button" class="link text-[13px] px-1 py-1" (click)="clearAll()">Clear all</button></li>
        </ul>
      }

      <div class="grid lg:grid-cols-[232px_minmax(0,1fr)] gap-4 items-start">
        <aside class="hidden lg:block panel p-4" aria-label="Filters"><ng-container *ngTemplateOutlet="filters" /></aside>

        <div>
          @if (paged().length) {
            <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5">
              @for (p of paged(); track p.id) { <li class="min-w-0"><kd-product-card [product]="p" /></li> }
            </ul>
            @if (pages() > 1) {
              <nav class="flex flex-wrap justify-center gap-1 mt-5" aria-label="Pagination">
                <button type="button" class="pg" [disabled]="page() === 1" (click)="toPage(page() - 1)">Previous</button>
                @for (n of pageList(); track n) {
                  <button type="button" class="pg" [class.pg-on]="n === page()" [attr.aria-current]="n === page() ? 'page' : null" (click)="toPage(n)">{{ n }}</button>
                }
                <button type="button" class="pg" [disabled]="page() === pages()" (click)="toPage(page() + 1)">Next</button>
              </nav>
            }
          } @else {
            <kd-empty title="No products match" [text]="query().q ? 'Check the spelling of “' + query().q + '” or try a broader term.' : 'Remove a filter to see more products.'">
              <button type="button" class="btn btn-primary" (click)="clearAll()">Clear search and filters</button>
            </kd-empty>
          }
        </div>
      </div>
    </div>

    @if (filtersOpen()) {
      <div class="fixed inset-0 z-50 bg-black/50 lg:hidden" (click)="filtersOpen.set(false)">
        <div role="dialog" aria-modal="true" aria-label="Filters" class="absolute inset-y-0 left-0 w-[86%] max-w-sm bg-white flex flex-col" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between px-4 py-3 border-b border-line">
            <h2 class="font-bold text-lg">Filters</h2>
            <button type="button" class="w-8 h-8 text-xl rounded hover:bg-cream-deep" aria-label="Close filters" (click)="filtersOpen.set(false)">×</button>
          </div>
          <div class="flex-1 overflow-y-auto p-4"><ng-container *ngTemplateOutlet="filters" /></div>
          <div class="p-3 border-t border-line"><button type="button" class="btn btn-primary w-full" (click)="filtersOpen.set(false)">Show {{ results().length }} products</button></div>
        </div>
      </div>
    }

    <ng-template #filters>
      <div class="space-y-5">
        <fieldset>
          <legend class="f-h">Category</legend>
          <ul class="space-y-0.5">
            <li><button type="button" class="f-link" [class.f-on]="!query().category" (click)="patch({ cat: null, brand: null })">All categories</button></li>
            @for (c of catalog.categories; track c.slug) {
              <li><button type="button" class="f-link" [class.f-on]="query().category === c.slug" (click)="patch({ cat: c.slug, brand: null })">{{ c.name }}</button></li>
            }
          </ul>
        </fieldset>
        <fieldset>
          <legend class="f-h">Price</legend>
          <ul class="space-y-0.5 mb-2">
            @for (r of ranges; track r.label) {
              <li><button type="button" class="f-link" [class.f-on]="query().min === r.min && query().max === r.max" (click)="patch({ min: r.min ?? null, max: r.max ?? null })">{{ r.label }}</button></li>
            }
          </ul>
          <form class="flex items-center gap-1.5" (submit)="$event.preventDefault(); applyPrice()">
            <input class="field !py-1 !px-2" name="min" inputmode="numeric" placeholder="Min" aria-label="Minimum price" [(ngModel)]="minInput" />
            <input class="field !py-1 !px-2" name="max" inputmode="numeric" placeholder="Max" aria-label="Maximum price" [(ngModel)]="maxInput" />
            <button class="btn btn-outline !py-1 !px-2.5">Go</button>
          </form>
        </fieldset>
        <fieldset>
          <legend class="f-h">Customer rating</legend>
          <ul class="space-y-0.5">
            @for (r of [4.5, 4, 3.5]; track r) {
              <li><button type="button" class="f-link" [class.f-on]="query().rating === r" (click)="patch({ rating: query().rating === r ? null : r })"><span class="text-star" aria-hidden="true">★</span> {{ r }} and up</button></li>
            }
          </ul>
        </fieldset>
        @if (brandOptions().length) {
          <fieldset>
            <legend class="f-h">Brand</legend>
            <ul class="space-y-1">
              @for (b of visibleBrands(); track b.name) {
                <li><label class="flex items-center gap-2 cursor-pointer min-h-6">
                  <input type="checkbox" class="w-4 h-4 accent-forest" [checked]="query().brands?.includes(b.name)" (change)="toggleBrand(b.name)" />
                  <span class="flex-1 truncate">{{ b.name }}</span><span class="text-xs text-ink-soft">{{ b.count }}</span>
                </label></li>
              }
            </ul>
            @if (brandOptions().length > 10) {
              <button type="button" class="link text-[13px] mt-1.5" (click)="allBrands.set(!allBrands())">{{ allBrands() ? 'Show fewer' : 'Show all ' + brandOptions().length }}</button>
            }
          </fieldset>
        }
      </div>
    </ng-template>`,
  styles: `
    .f-h { font-weight: 700; margin-bottom: .35rem; }
    .f-link { text-align: left; width: 100%; padding: .15rem .35rem; margin-inline: -.35rem; border-radius: 3px; min-height: 26px; }
    .f-link:hover { background: var(--color-cream); }
    .f-on { font-weight: 700; color: var(--color-forest); background: var(--color-sage-soft); }
    .pg { min-width: 38px; height: 38px; padding: 0 .7rem; border: 1px solid var(--color-line); background: #fff; border-radius: 4px; font-weight: 500; }
    .pg:hover:not(:disabled) { background: var(--color-cream-deep); } .pg:disabled { opacity: .45; }
    .pg-on { background: var(--color-forest); border-color: var(--color-forest); color: #fff; } .pg-on:hover { background: var(--color-forest) !important; }
  `,
})
export class ListingPage {
  catalog = inject(CatalogService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  ranges = PRICE_RANGES;
  filtersOpen = signal(false);
  allBrands = signal(false);
  minInput = '';
  maxInput = '';

  private params = toSignal(this.route.queryParamMap, { requireSync: true });

  query = computed<ProductQuery>(() => {
    const p = this.params();
    const num = (k: string) => { const v = p.get(k); return v == null || v === '' || isNaN(+v) ? undefined : +v; };
    return {
      q: p.get('q') ?? undefined, category: p.get('cat') ?? undefined,
      brands: p.get('brand')?.split('|').filter(Boolean), min: num('min'), max: num('max'), rating: num('rating'),
      deals: p.get('deals') === '1', sort: (p.get('sort') as SortKey) ?? 'popular',
    };
  });
  page = computed(() => Math.min(Math.max(1, +(this.params().get('page') ?? 1) || 1), Math.max(1, this.pages())));
  results = computed(() => this.catalog.query(this.query()));
  pages = computed(() => Math.ceil(this.results().length / PAGE_SIZE));
  paged = computed(() => this.results().slice((this.page() - 1) * PAGE_SIZE, this.page() * PAGE_SIZE));
  pageList = computed(() => Array.from({ length: this.pages() }, (_, i) => i + 1));

  heading = computed(() => {
    const q = this.query();
    const cat = this.catalog.category(q.category)?.name;
    if (q.q) return `Results for “${q.q}”` + (cat ? ` in ${cat}` : '');
    if (q.deals) return "Today's offers" + (cat ? ` in ${cat}` : '');
    return cat ?? 'All products';
  });

  brandOptions = computed(() => {
    const counts = new Map<string, number>();
    this.catalog.base(this.query()).forEach((p) => counts.set(p.brand, (counts.get(p.brand) ?? 0) + 1));
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  });
  visibleBrands = computed(() => {
    const selected = this.query().brands ?? [];
    const list = this.brandOptions();
    if (this.allBrands()) return list;
    return [...list.slice(0, 10), ...list.slice(10).filter((b) => selected.includes(b.name))];
  });

  chips = computed(() => {
    const q = this.query();
    const out: { label: string; clear: Params }[] = [];
    if (q.category) out.push({ label: this.catalog.category(q.category)?.short ?? q.category, clear: { cat: null } });
    if (q.deals) out.push({ label: "Today's offers", clear: { deals: null } });
    (q.brands ?? []).forEach((b) => out.push({ label: b, clear: { brand: q.brands!.filter((x) => x !== b).join('|') || null } }));
    if (q.min != null || q.max != null) {
      const f = (n: number) => '₹' + n.toLocaleString('en-IN');
      out.push({ label: q.min != null && q.max != null ? `${f(q.min)} to ${f(q.max)}` : q.min != null ? `From ${f(q.min)}` : `Up to ${f(q.max!)}`, clear: { min: null, max: null } });
    }
    if (q.rating) out.push({ label: `${q.rating} stars and up`, clear: { rating: null } });
    return out;
  });
  activeCount = computed(() => this.chips().length);

  patch(params: Params) {
    this.router.navigate([], { relativeTo: this.route, queryParams: { page: null, ...params }, queryParamsHandling: 'merge' });
  }
  toPage(n: number) {
    this.router.navigate([], { relativeTo: this.route, queryParams: { page: n === 1 ? null : n }, queryParamsHandling: 'merge' });
  }
  toggleBrand(name: string) {
    const cur = this.query().brands ?? [];
    const next = cur.includes(name) ? cur.filter((b) => b !== name) : [...cur, name];
    this.patch({ brand: next.join('|') || null });
  }
  applyPrice() {
    const clean = (v: string) => { const s = String(v ?? '').replace(/[^\d]/g, ''); return s ? +s : null; };
    this.patch({ min: clean(this.minInput), max: clean(this.maxInput) });
  }
  clearAll() {
    this.minInput = this.maxInput = '';
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
  }
}

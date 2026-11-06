import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EmptyState, ImgFallback, InrPipe } from '../components/ui';
import { CatalogService } from '../services/catalog.service';
import { ToastService } from '../services/toast.service';
import { LOW_STOCK } from './admin';

const PAGE = 25;
const PLACEHOLDER = 'catalog/placeholder.svg';

@Component({
  selector: 'kd-admin-products',
  imports: [FormsModule, RouterLink, EmptyState, ImgFallback, InrPipe],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
      <h1 class="text-[24px] font-bold">Products <span class="text-ink-soft font-normal text-[16px]">{{ filtered().length }}</span></h1>
      <a routerLink="/admin/products/new" class="btn btn-primary">Add product</a>
    </div>
    <div class="flex flex-wrap gap-2 mb-3">
      <input class="field !w-auto flex-1 min-w-[12rem]" type="search" aria-label="Search products" placeholder="Search by name, brand or item code" [ngModel]="term()" (ngModelChange)="term.set($event); page.set(1)" />
      <select class="field !w-auto" aria-label="Filter by category" [ngModel]="cat()" (ngModelChange)="cat.set($event); page.set(1)">
        <option value="">All categories</option>
        @for (c of catalog.categories; track c.slug) { <option [value]="c.slug">{{ c.short }}</option> }
      </select>
      <label class="flex items-center gap-2"><input type="checkbox" class="w-4 h-4 accent-forest" [ngModel]="lowOnly()" (ngModelChange)="lowOnly.set($event); page.set(1)" /> Low stock only</label>
    </div>
    @if (rows().length) {
      <div class="panel relative overflow-x-auto">
        <table class="w-full text-left min-w-[680px]">
          <thead class="text-[13px] text-ink-soft"><tr class="border-b border-line">
            <th scope="col" class="p-2.5 font-medium">Product</th><th scope="col" class="p-2.5 font-medium">Category</th>
            <th scope="col" class="p-2.5 font-medium text-right">Price</th><th scope="col" class="p-2.5 font-medium text-right">Stock</th><th scope="col" class="p-2.5"><span class="sr-only">Actions</span></th></tr></thead>
          <tbody>
            @for (p of rows(); track p.id) {
              <tr class="border-b border-cream-deep last:border-0">
                <td class="p-2.5"><div class="flex items-center gap-2.5 min-w-0">
                  <img kdImg [src]="p.thumb" [alt]="p.title" loading="lazy" class="w-10 h-10 object-contain shrink-0" />
                  <span class="min-w-0"><a [routerLink]="['/admin/products', p.id]" class="font-medium hover:text-forest-soft">{{ p.title }}</a><br /><span class="text-xs text-ink-soft">{{ p.brand }}, {{ p.sku }}</span></span>
                </div></td>
                <td class="p-2.5 whitespace-nowrap">{{ catalog.category(p.category)?.short }}</td>
                <td class="p-2.5 text-right tabular-nums whitespace-nowrap">{{ p.price | inr }}<br /><span class="text-xs text-ink-soft">{{ p.disc }}% off</span></td>
                <td class="p-2.5 text-right tabular-nums" [class.text-sale]="p.stock === 0" [class.font-semibold]="p.stock < low">{{ p.stock }}</td>
                <td class="p-2.5 text-right whitespace-nowrap">
                  @if (confirmId() === p.id) {
                    <button type="button" class="link !text-sale mr-3" (click)="remove(p.id, p.title)" [attr.aria-label]="'Confirm delete ' + p.title">Confirm delete</button>
                    <button type="button" class="link" (click)="confirmId.set(null)">Keep</button>
                  } @else {
                    <a [routerLink]="['/admin/products', p.id]" class="link mr-3" [attr.aria-label]="'Edit ' + p.title">Edit</a>
                    <button type="button" class="link" (click)="confirmId.set(p.id)" [attr.aria-label]="'Delete ' + p.title">Delete</button>
                  }
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      @if (pages() > 1) {
        <nav class="flex items-center justify-center gap-3 mt-3" aria-label="Pagination">
          <button type="button" class="btn btn-outline !py-1" [disabled]="page() === 1" [class.opacity-40]="page() === 1" (click)="page.set(page() - 1)">Previous</button>
          <span>Page {{ page() }} of {{ pages() }}</span>
          <button type="button" class="btn btn-outline !py-1" [disabled]="page() === pages()" [class.opacity-40]="page() === pages()" (click)="page.set(page() + 1)">Next</button>
        </nav>
      }
    } @else {
      <kd-empty title="No products match" text="Change the search or filters, or add a new product." />
    }
    @if (catalog.hasEdits()) {
      <div class="mt-5 text-[13px]">
        @if (confirmReset()) {
          <span class="mr-2">This removes every product change, including stock changes from orders.</span>
          <button type="button" class="link !text-sale mr-3" (click)="reset()">Confirm restore</button>
          <button type="button" class="link" (click)="confirmReset.set(false)">Keep my changes</button>
        } @else {
          <button type="button" class="link" (click)="confirmReset.set(true)">Restore the sample catalogue</button>
        }
      </div>
    }`,
})
export class AdminProducts {
  catalog = inject(CatalogService);
  private toast = inject(ToastService);
  low = LOW_STOCK;
  term = signal('');
  cat = signal('');
  lowOnly = signal(false);
  page = signal(1);
  confirmId = signal<number | null>(null);
  confirmReset = signal(false);

  filtered = computed(() => {
    const t = this.term().trim().toLowerCase();
    return this.catalog.products.filter((p) =>
      (!this.cat() || p.category === this.cat()) && (!this.lowOnly() || p.stock < LOW_STOCK) &&
      (!t || `${p.title} ${p.brand} ${p.sku}`.toLowerCase().includes(t)));
  });
  pages = computed(() => Math.max(1, Math.ceil(this.filtered().length / PAGE)));
  rows = computed(() => {
    const page = Math.min(this.page(), this.pages());
    return this.filtered().slice((page - 1) * PAGE, page * PAGE);
  });

  remove(id: number, title: string) {
    this.catalog.remove(id);
    this.confirmId.set(null);
    this.toast.show({ text: 'Deleted: ' + title });
  }
  reset() {
    this.catalog.restoreSampleCatalog();
    this.confirmReset.set(false);
    this.toast.show({ text: 'Sample catalogue restored' });
  }
}

interface Draft {
  title: string; brand: string; category: string; description: string; price: number | null; mrp: number | null;
  stock: number | null; images: string; deal: boolean; label: string; warranty: string; shipping: string; returns: string;
}

@Component({
  selector: 'kd-admin-product-form',
  imports: [FormsModule, RouterLink, EmptyState, ImgFallback],
  template: `
    @if (id() && !existing()) {
      <kd-empty title="Product not found" text="It may have been deleted."><a routerLink="/admin/products" class="btn btn-primary">Back to products</a></kd-empty>
    } @else {
      <a routerLink="/admin/products" class="link text-[13px]">Back to products</a>
      <h1 class="text-[24px] font-bold mt-1 mb-3">{{ id() ? 'Edit product' : 'Add product' }}</h1>
      <form class="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-3 items-start" (submit)="$event.preventDefault(); submit()" novalidate>
        <div class="panel p-4 grid sm:grid-cols-2 gap-3">
          <div class="sm:col-span-2"><label class="field-label" for="f-title">Product name</label>
            <input id="f-title" name="title" class="field" [class.invalid]="e()['title']" [(ngModel)]="d.title" />
            @if (e()['title']) { <p class="field-error">{{ e()['title'] }}</p> }</div>
          <div><label class="field-label" for="f-brand">Brand</label>
            <input id="f-brand" name="brand" class="field" [class.invalid]="e()['brand']" [(ngModel)]="d.brand" />
            @if (e()['brand']) { <p class="field-error">{{ e()['brand'] }}</p> }</div>
          <div><label class="field-label" for="f-cat">Category</label>
            <select id="f-cat" name="cat" class="field" [class.invalid]="e()['category']" [(ngModel)]="d.category">
              <option value="">Select</option>
              @for (c of catalog.categories; track c.slug) { <option [value]="c.slug">{{ c.name }}</option> }
            </select>
            @if (e()['category']) { <p class="field-error">{{ e()['category'] }}</p> }</div>
          <div class="sm:col-span-2"><label class="field-label" for="f-desc">Description</label>
            <textarea id="f-desc" name="desc" rows="4" class="field" [class.invalid]="e()['description']" [(ngModel)]="d.description"></textarea>
            @if (e()['description']) { <p class="field-error">{{ e()['description'] }}</p> }</div>
          <div class="sm:col-span-2"><label class="field-label" for="f-img">Image URLs, one per line</label>
            <textarea id="f-img" name="img" rows="3" class="field" [class.invalid]="e()['images']" placeholder="https://example.com/photo.jpg" [(ngModel)]="d.images"></textarea>
            @if (e()['images']) { <p class="field-error">{{ e()['images'] }}</p> } @else { <p class="text-xs text-ink-soft mt-0.5">The first image is the main photo. Leave empty to show a placeholder.</p> }</div>
          <div><label class="field-label" for="f-warranty">Warranty</label><input id="f-warranty" name="warranty" class="field" [(ngModel)]="d.warranty" /></div>
          <div><label class="field-label" for="f-returns">Returns</label><input id="f-returns" name="returns" class="field" [(ngModel)]="d.returns" /></div>
          <div class="sm:col-span-2"><label class="field-label" for="f-ship">Shipping</label><input id="f-ship" name="ship" class="field" [(ngModel)]="d.shipping" /></div>
        </div>
        <div class="space-y-3">
          <div class="panel p-4 space-y-3">
            <div><label class="field-label" for="f-price">Selling price (₹)</label>
              <input id="f-price" name="price" type="number" min="1" class="field" [class.invalid]="e()['price']" [(ngModel)]="d.price" />
              @if (e()['price']) { <p class="field-error">{{ e()['price'] }}</p> }</div>
            <div><label class="field-label" for="f-mrp">MRP (₹)</label>
              <input id="f-mrp" name="mrp" type="number" min="1" class="field" [class.invalid]="e()['mrp']" [(ngModel)]="d.mrp" />
              @if (e()['mrp']) { <p class="field-error">{{ e()['mrp'] }}</p> }</div>
            <div><label class="field-label" for="f-stock">Stock</label>
              <input id="f-stock" name="stock" type="number" min="0" class="field" [class.invalid]="e()['stock']" [(ngModel)]="d.stock" />
              @if (e()['stock']) { <p class="field-error">{{ e()['stock'] }}</p> }</div>
            <div><label class="field-label" for="f-label">Label on product card</label>
              <select id="f-label" name="label" class="field" [(ngModel)]="d.label">
                <option value="">None</option>
                @for (l of labels; track l) { <option [value]="l">{{ l }}</option> }
              </select></div>
            <label class="flex items-center gap-2"><input type="checkbox" name="deal" class="w-4 h-4 accent-forest" [(ngModel)]="d.deal" /> Show in today's deals</label>
          </div>
          @if (firstImage(); as src) {
            <div class="panel p-3"><p class="text-[13px] text-ink-soft mb-1">Current main photo</p><img kdImg [src]="src" alt="Main product photo" class="w-full aspect-square object-contain" /></div>
          }
          <div class="flex gap-2">
            <button class="btn btn-primary flex-1">{{ id() ? 'Save changes' : 'Add product' }}</button>
            <a routerLink="/admin/products" class="btn btn-outline">Cancel</a>
          </div>
        </div>
      </form>
    }`,
})
export class AdminProductForm {
  id = input<string>();
  catalog = inject(CatalogService);
  private router = inject(Router);
  private toast = inject(ToastService);
  labels = ['Best seller', 'New', 'Limited deal', 'Almost gone'];
  existing = computed(() => (this.id() ? this.catalog.get(+this.id()!) : undefined));
  firstImage = computed(() => this.existing()?.thumb);
  e = signal<Record<string, string>>({});
  d: Draft = { title: '', brand: '', category: '', description: '', price: null, mrp: null, stock: 0, images: '', deal: false, label: '', warranty: '1 year warranty', shipping: 'Ships in 2-3 business days', returns: '7 days return policy' };

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => {
        const p = id ? this.catalog.get(+id) : undefined;
        if (p) this.d = { title: p.title, brand: p.brand, category: p.category, description: p.description, price: p.price, mrp: p.mrp, stock: p.stock, images: p.images.join('\n'), deal: !!p.deal, label: p.label ?? '', warranty: p.warranty, shipping: p.shipping, returns: p.returns };
      });
    });
  }

  submit() {
    const d = this.d;
    const err: Record<string, string> = {};
    const urls = d.images.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!d.title.trim()) err['title'] = 'Enter the product name.';
    if (!d.brand.trim()) err['brand'] = 'Enter the brand.';
    if (!d.category) err['category'] = 'Select a category.';
    if (!d.description.trim()) err['description'] = 'Enter a description.';
    if (!d.price || d.price < 1) err['price'] = 'Enter a price of at least ₹1.';
    if (!d.mrp || d.mrp < (d.price ?? 0)) err['mrp'] = 'MRP must be the same as the price or higher.';
    if (d.stock == null || d.stock < 0 || !Number.isInteger(d.stock)) err['stock'] = 'Enter a whole number, 0 or more.';
    if (urls.some((u) => !/^(https?:\/\/\S+|catalog\/\S+)$/.test(u))) err['images'] = 'Each image must be a full link starting with http:// or https://.';
    this.e.set(err);
    if (Object.keys(err).length) return;

    const images = urls.length ? urls : [PLACEHOLDER];
    const fields = {
      title: d.title.trim(), brand: d.brand.trim(), category: d.category, description: d.description.trim(),
      price: d.price!, mrp: d.mrp!, disc: Math.round((1 - d.price! / d.mrp!) * 100), stock: d.stock!, images, thumb: this.thumbFor(images),
      deal: d.deal, label: d.label || undefined, warranty: d.warranty.trim(), shipping: d.shipping.trim(), returns: d.returns.trim(),
    };
    const old = this.existing();
    if (old) this.catalog.update(old.id, fields);
    else this.catalog.create(fields);
    this.toast.show({ text: old ? 'Changes saved' : 'Product added' });
    this.router.navigateByUrl('/admin/products');
  }

  /** Keeps the existing small thumbnail unless the main image changed. */
  private thumbFor(images: string[]): string {
    const old = this.existing();
    return old && old.images[0] === images[0] ? old.thumb : images[0];
  }
}

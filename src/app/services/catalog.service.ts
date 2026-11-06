import { Injectable, computed, signal } from '@angular/core';
import { CATEGORIES } from '../data/categories';
import { PRODUCTS } from '../data/products.data';
import { Category, Product } from '../models';
import { load, save } from './storage';

export type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'newest' | 'rating';

interface CatalogEdits { edited: Record<number, Partial<Product>>; added: Product[]; deleted: number[]; }

export interface ProductQuery {
  q?: string; category?: string; brands?: string[]; min?: number; max?: number;
  rating?: number; deals?: boolean; sort?: SortKey;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly categories = CATEGORIES;
  /** Admin changes, stored on top of the sample catalogue. */
  private edits = signal<CatalogEdits>(load('catalogEdits', { edited: {}, added: [], deleted: [] }));
  private list = computed<Product[]>(() => {
    const { edited, added, deleted } = this.edits();
    const gone = new Set(deleted);
    return [...PRODUCTS, ...added].filter((p) => !gone.has(p.id)).map((p) => ({ ...p, ...edited[p.id] }));
  });
  private byId = computed(() => new Map(this.list().map((p) => [p.id, p])));
  private bySlug = computed(() => new Map(this.list().map((p) => [p.slug, p])));
  readonly hasEdits = computed(() => {
    const e = this.edits();
    return Object.keys(e.edited).length + e.added.length + e.deleted.length > 0;
  });

  get products(): Product[] { return this.list(); }
  get(id: number): Product | undefined { return this.byId().get(id); }
  getBySlug(slug: string): Product | undefined { return this.bySlug().get(slug); }

  private writeEdits(next: CatalogEdits) { this.edits.set(next); save('catalogEdits', next); }

  update(id: number, changes: Partial<Product>) {
    const e = this.edits();
    this.writeEdits(e.added.some((p) => p.id === id)
      ? { ...e, added: e.added.map((p) => (p.id === id ? { ...p, ...changes } : p)) }
      : { ...e, edited: { ...e.edited, [id]: { ...e.edited[id], ...changes } } });
  }

  create(draft: Omit<Product, 'id' | 'slug' | 'sub' | 'rating' | 'ratingCount' | 'popularity' | 'trend' | 'addedDaysAgo' | 'sku' | 'reviews' | 'tags'>): Product {
    const e = this.edits();
    const id = Math.max(0, ...PRODUCTS.map((p) => p.id), ...e.added.map((p) => p.id)) + 1;
    const product: Product = {
      ...draft, id, slug: draft.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + id,
      sub: draft.category, rating: 0, ratingCount: 0, popularity: 0, trend: 0, addedDaysAgo: 0, sku: 'KD-' + id, reviews: [], tags: [],
    };
    this.writeEdits({ ...e, added: [...e.added, product] });
    return product;
  }

  remove(id: number) {
    const e = this.edits();
    const isAdded = e.added.some((p) => p.id === id);
    this.writeEdits({ ...e, added: e.added.filter((p) => p.id !== id), deleted: isAdded ? e.deleted : [...e.deleted, id] });
  }

  adjustStock(id: number, delta: number) {
    const p = this.get(id);
    if (p) this.update(id, { stock: Math.max(0, p.stock + delta) });
  }

  restoreSampleCatalog() { this.writeEdits({ edited: {}, added: [], deleted: [] }); }

  category(slug?: string | null): Category | undefined { return this.categories.find((c) => c.slug === slug); }

  private haystack(p: Product): string {
    return [p.title, p.brand, p.sub, this.category(p.category)?.name, ...p.tags, ...Object.values(p.extra ?? {})].join(' ').toLowerCase();
  }

  search(q: string, category?: string): Product[] {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return this.products
      .filter((p) => (!category || p.category === category) && terms.every((t) => this.haystack(p).includes(t)))
      .sort((a, b) => Number(b.title.toLowerCase().includes(q.toLowerCase())) - Number(a.title.toLowerCase().includes(q.toLowerCase())) || b.popularity - a.popularity);
  }

  /** Products matching everything except the facet filters, used to build the filter options. */
  base(q: ProductQuery): Product[] {
    let list = q.q?.trim() ? this.search(q.q) : this.products;
    if (q.category) list = list.filter((p) => p.category === q.category);
    if (q.deals) list = list.filter((p) => p.deal);
    return list;
  }

  query(q: ProductQuery): Product[] {
    let list = this.base(q);
    if (q.brands?.length) list = list.filter((p) => q.brands!.includes(p.brand));
    if (q.min != null) list = list.filter((p) => p.price >= q.min!);
    if (q.max != null) list = list.filter((p) => p.price <= q.max!);
    if (q.rating) list = list.filter((p) => p.rating >= q.rating!);
    return this.sort(list, q.sort, !!q.q?.trim());
  }

  private sort(list: Product[], sort: SortKey | undefined, keepRelevance: boolean): Product[] {
    const out = [...list];
    switch (sort) {
      case 'price-asc': return out.sort((a, b) => a.price - b.price);
      case 'price-desc': return out.sort((a, b) => b.price - a.price);
      case 'newest': return out.sort((a, b) => a.addedDaysAgo - b.addedDaysAgo);
      case 'rating': return out.sort((a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount);
      default: return keepRelevance ? out : out.sort((a, b) => b.popularity - a.popularity);
    }
  }

  deals(): Product[] { return this.products.filter((p) => p.deal).sort((a, b) => b.disc - a.disc); }
  bestSellers(n = 12): Product[] { return [...this.products].sort((a, b) => b.ratingCount - a.ratingCount).slice(0, n); }
  trending(n = 12): Product[] { return [...this.products].sort((a, b) => b.trend - a.trend).slice(0, n); }

  related(p: Product, n = 8): Product[] {
    const score = (o: Product) => (o.sub === p.sub ? 2 : 0) + (o.brand === p.brand ? 1 : 0);
    return this.products
      .filter((o) => o.id !== p.id && o.category === p.category)
      .sort((a, b) => score(b) - score(a) || b.popularity - a.popularity)
      .slice(0, n);
  }

  recommended(seedIds: number[], n = 12): Product[] {
    const seeds = seedIds.map((id) => this.get(id)).filter((p): p is Product => !!p);
    const cats = new Set(seeds.map((p) => p.category));
    const skip = new Set(seedIds);
    const pool = this.products.filter((p) => !skip.has(p.id) && p.stock > 0);
    const rank = (p: Product) => (cats.has(p.category) ? 10 : 0) + p.rating + p.popularity / 1000;
    return pool.sort((a, b) => rank(b) - rank(a)).slice(0, n);
  }
}

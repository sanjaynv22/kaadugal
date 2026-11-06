import { Injectable, computed, inject, signal } from '@angular/core';
import { Product } from '../models';
import { CatalogService } from './catalog.service';
import { load, save } from './storage';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private catalog = inject(CatalogService);
  readonly ids = signal<number[]>(load('wishlist', []));
  readonly count = computed(() => this.ids().length);
  readonly products = computed(() => this.ids().map((id) => this.catalog.get(id)).filter((p): p is Product => !!p));

  has(id: number) { return this.ids().includes(id); }
  toggle(id: number): boolean {
    const added = !this.has(id);
    this.ids.set(added ? [id, ...this.ids()] : this.ids().filter((x) => x !== id));
    save('wishlist', this.ids());
    return added;
  }
}

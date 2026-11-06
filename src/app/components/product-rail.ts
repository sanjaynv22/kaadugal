import { Component, ElementRef, input, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../models';
import { ProductCard } from './product-card';

@Component({
  selector: 'kd-rail',
  imports: [ProductCard, RouterLink],
  template: `
    <section [attr.aria-label]="title()" class="mt-6">
      <div class="flex items-end justify-between gap-3 mb-2.5">
        <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1 min-w-0">
          <h2 class="text-xl font-bold">{{ title() }}</h2>
          <ng-content />
        </div>
        <div class="flex items-center gap-1.5 shrink-0">
          @if (link()) {
            <a class="link whitespace-nowrap mr-2" [routerLink]="link()" [queryParams]="linkParams()">See all</a>
          }
          <button type="button" (click)="scroll(-1)" class="hidden md:grid w-8 h-8 place-items-center rounded border border-line bg-white hover:bg-cream-deep" [attr.aria-label]="'Scroll ' + title() + ' back'">‹</button>
          <button type="button" (click)="scroll(1)" class="hidden md:grid w-8 h-8 place-items-center rounded border border-line bg-white hover:bg-cream-deep" [attr.aria-label]="'Scroll ' + title() + ' forward'">›</button>
        </div>
      </div>
      <div #track class="flex gap-2.5 overflow-x-auto no-scrollbar snap-x scroll-smooth pb-0.5">
        @for (p of products(); track p.id) {
          <kd-product-card [product]="p" class="snap-start shrink-0 w-[160px] sm:w-[190px] lg:w-[208px]" />
        }
      </div>
    </section>`,
})
export class ProductRail {
  title = input.required<string>();
  products = input.required<Product[]>();
  link = input<string | null>(null);
  linkParams = input<Record<string, string> | null>(null);
  track = viewChild.required<ElementRef<HTMLElement>>('track');
  scroll(dir: number) {
    const el = this.track().nativeElement;
    el.scrollBy({ left: dir * el.clientWidth * 0.85 });
  }
}

import { DecimalPipe } from '@angular/common';
import { Component, Directive, ElementRef, HostListener, Pipe, PipeTransform, inject, input, output } from '@angular/core';

@Pipe({ name: 'inr' })
export class InrPipe implements PipeTransform {
  transform(v: number): string { return '₹' + Math.round(v).toLocaleString('en-IN'); }
}

/** Replaces a failed product photo with a quiet, labelled placeholder. */
@Directive({ selector: 'img[kdImg]' })
export class ImgFallback {
  private el = inject(ElementRef<HTMLImageElement>);
  @HostListener('error') onError() {
    const img = this.el.nativeElement;
    if (img.dataset['failed']) return;
    img.dataset['failed'] = '1';
    const text = (img.alt || 'KAADUGAL').slice(0, 26).replace(/[<&>"]/g, '');
    img.src = 'data:image/svg+xml,' + encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#EDE9DD"/><path d="M200 120l44 58h-23l32 44h-40v42h-26v-42h-40l32-44h-23z" fill="#A8B5A0"/><text x="200" y="310" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#5A625D">${text}</text></svg>`);
  }
}

@Component({
  selector: 'kd-stars',
  imports: [DecimalPipe],
  template: `
    <span class="inline-flex items-center gap-1 align-middle" [attr.aria-label]="'Rated ' + value() + ' out of 5'">
      <span class="relative inline-block leading-none text-[13px] tracking-[1px] text-sage-soft" aria-hidden="true">★★★★★
        <span class="absolute inset-0 overflow-hidden whitespace-nowrap text-star" [style.width.%]="value() * 20">★★★★★</span>
      </span>
      @if (count() != null) {
        <span class="text-xs text-ink-soft">{{ value() | number: '1.1-1' }} ({{ count() | number }})</span>
      }
    </span>`,
})
export class Stars {
  value = input.required<number>();
  count = input<number | null>(null);
}

@Component({
  selector: 'kd-qty',
  template: `
    <div class="inline-flex items-stretch rounded border border-[#C9C5B8] bg-white" role="group" aria-label="Quantity">
      <button type="button" class="w-8 h-8 text-lg leading-none hover:bg-cream-deep disabled:opacity-40" [disabled]="value() <= min()" (click)="change.emit(value() - 1)" aria-label="Decrease quantity">−</button>
      <span class="w-9 text-center self-center font-semibold" aria-live="polite">{{ value() }}</span>
      <button type="button" class="w-8 h-8 text-lg leading-none hover:bg-cream-deep disabled:opacity-40" [disabled]="value() >= max()" (click)="change.emit(value() + 1)" aria-label="Increase quantity">+</button>
    </div>`,
})
export class QtyStepper {
  value = input.required<number>();
  min = input(1);
  max = input(10);
  change = output<number>();
}

@Component({
  selector: 'kd-logo',
  template: `
    <span class="inline-flex items-center gap-1.5 text-white">
      <svg viewBox="0 0 28 32" class="w-5 h-6" aria-hidden="true"><path d="M14 1l8 10.5h-4.2L24 20H16v11h-4V20H4l6.2-8.5H6z" fill="currentColor"/></svg>
      <span class="font-display font-bold text-[20px] tracking-[0.04em] leading-none" [class.text-forest]="dark()">KAADUGAL</span>
    </span>`,
})
export class Logo {
  dark = input(false);
}

@Component({
  selector: 'kd-empty',
  template: `
    <div class="panel px-6 py-12 text-center">
      <h2 class="text-xl font-bold">{{ title() }}</h2>
      <p class="text-ink-soft mt-1 mb-4">{{ text() }}</p>
      <ng-content />
    </div>`,
})
export class EmptyState {
  title = input.required<string>();
  text = input('');
}

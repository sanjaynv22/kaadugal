import { Component, input } from '@angular/core';
import { Totals } from '../models';
import { InrPipe } from './ui';

@Component({
  selector: 'kd-price-breakdown',
  imports: [InrPipe],
  template: `
    @let t = totals();
    <dl class="space-y-1.5">
      <div class="flex justify-between"><dt>Price ({{ t.count }} {{ t.count === 1 ? 'item' : 'items' }})</dt><dd class="tabular-nums">{{ t.mrp | inr }}</dd></div>
      <div class="flex justify-between"><dt>Discount</dt><dd class="tabular-nums text-sale">−{{ t.discount | inr }}</dd></div>
      <div class="flex justify-between"><dt>Subtotal</dt><dd class="tabular-nums">{{ t.subtotal | inr }}</dd></div>
      <div class="flex justify-between"><dt>Delivery</dt><dd class="tabular-nums">{{ t.delivery ? (t.delivery | inr) : 'Free' }}</dd></div>
      <div class="flex justify-between border-t border-line pt-2 mt-1 text-[17px] font-bold"><dt>Total</dt><dd class="tabular-nums">{{ t.total | inr }}</dd></div>
    </dl>`,
})
export class PriceBreakdown {
  totals = input.required<Totals>();
}

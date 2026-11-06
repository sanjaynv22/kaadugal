import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AddressForm } from '../components/address-form';
import { PriceBreakdown } from '../components/order-summary';
import { EmptyState, ImgFallback, InrPipe } from '../components/ui';
import { CartItem, PaymentMethod } from '../models';
import { AuthService } from '../services/auth.service';
import { CartService, totalsFor } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'kd-checkout',
  imports: [RouterLink, FormsModule, AddressForm, PriceBreakdown, EmptyState, ImgFallback, InrPipe],
  template: `
    <div class="page py-4 max-w-[1120px]">
      <h1 class="text-[24px] font-bold mb-3">Checkout</h1>
      @if (items().length) {
        <div class="grid lg:grid-cols-[minmax(0,1fr)_330px] gap-4 items-start">
          <div class="space-y-3">
            <section class="panel p-4" aria-labelledby="s1">
              <div class="flex items-center justify-between mb-2">
                <h2 id="s1" class="text-lg font-bold">1. Delivery address</h2>
                @if (auth.addresses().length && !adding()) { <button type="button" class="link text-[13px]" (click)="adding.set(true)">Add new address</button> }
              </div>
              @if (adding() || !auth.addresses().length) {
                <kd-address-form (saved)="selectedId.set($event.id); adding.set(false)" (cancelled)="adding.set(false)" />
              } @else {
                <ul class="space-y-2">
                  @for (a of auth.addresses(); track a.id) {
                    <li><label class="flex gap-2.5 rounded border p-3 cursor-pointer" [class]="a.id === addressId() ? 'border-forest bg-cream' : 'border-line'">
                      <input type="radio" name="addr" class="mt-1 accent-forest" [checked]="a.id === addressId()" (change)="selectedId.set(a.id)" />
                      <span><span class="font-semibold">{{ a.name }}</span>, {{ a.phone }}<br />{{ a.line1 }}{{ a.line2 ? ', ' + a.line2 : '' }}, {{ a.city }}, {{ a.state }} {{ a.pincode }}</span>
                    </label></li>
                  }
                </ul>
              }
            </section>

            <section class="panel p-4" aria-labelledby="s2">
              <h2 id="s2" class="text-lg font-bold mb-2">2. Payment method</h2>
              <p class="text-[13px] text-ink-soft mb-2.5">This is a demo checkout. No payment is taken and card details are not saved.</p>
              <div class="space-y-2" role="radiogroup" aria-labelledby="s2">
                @for (m of methods; track m.id) {
                  <div class="rounded border" [class]="method() === m.id ? 'border-forest bg-cream' : 'border-line'">
                    <label class="flex items-center gap-2.5 p-3 cursor-pointer">
                      <input type="radio" name="pay" class="accent-forest" [checked]="method() === m.id" (change)="method.set(m.id); payError.set('')" />
                      <span class="font-semibold">{{ m.label }}</span><span class="text-[13px] text-ink-soft hidden sm:inline">{{ m.note }}</span>
                    </label>
                    @if (method() === m.id && m.id === 'upi') {
                      <div class="px-3 pb-3 max-w-sm"><label class="field-label" for="upi">UPI ID</label><input id="upi" name="upi" class="field" placeholder="name@bank" [(ngModel)]="upi" /></div>
                    }
                    @if (method() === m.id && m.id === 'card') {
                      <div class="px-3 pb-3 grid grid-cols-2 gap-2 max-w-sm">
                        <div class="col-span-2"><label class="field-label" for="cc">Card number</label><input id="cc" name="cc" class="field" inputmode="numeric" autocomplete="off" maxlength="19" placeholder="16-digit number" [(ngModel)]="card" /></div>
                        <div><label class="field-label" for="exp">Expiry</label><input id="exp" name="exp" class="field" autocomplete="off" placeholder="MM/YY" maxlength="5" [(ngModel)]="exp" /></div>
                        <div><label class="field-label" for="cvv">CVV</label><input id="cvv" name="cvv" type="password" class="field" autocomplete="off" inputmode="numeric" maxlength="4" [(ngModel)]="cvv" /></div>
                      </div>
                    }
                    @if (method() === m.id && m.id === 'netbanking') {
                      <div class="px-3 pb-3 max-w-sm"><label class="field-label" for="bank">Bank</label>
                        <select id="bank" name="bank" class="field" [(ngModel)]="bank"><option value="">Select your bank</option>@for (b of banks; track b) { <option [value]="b">{{ b }}</option> }</select></div>
                    }
                  </div>
                }
              </div>
              @if (payError()) { <p class="field-error mt-2" role="alert">{{ payError() }}</p> }
            </section>

            <section class="panel p-4" aria-labelledby="s3">
              <h2 id="s3" class="text-lg font-bold mb-2">3. Review items</h2>
              <ul class="divide-y divide-cream-deep">
                @for (i of items(); track i.product.id) {
                  <li class="flex items-center gap-3 py-2">
                    <img kdImg [src]="i.product.thumb" [alt]="i.product.title" class="w-14 h-14 object-contain shrink-0" />
                    <span class="flex-1 min-w-0"><span class="block font-medium truncate">{{ i.product.title }}</span><span class="text-[13px] text-ink-soft">Quantity {{ i.qty }}</span></span>
                    <span class="font-semibold tabular-nums">{{ i.product.price * i.qty | inr }}</span>
                  </li>
                }
              </ul>
            </section>
          </div>
          <aside class="panel p-4 lg:sticky lg:top-3" aria-label="Order summary">
            <h2 class="text-lg font-bold mb-2">Order summary</h2>
            <kd-price-breakdown [totals]="totals()" />
            <button type="button" class="btn btn-primary w-full mt-3" (click)="place()">Place order</button>
            @if (addrError()) { <p class="field-error mt-2" role="alert">{{ addrError() }}</p> }
          </aside>
        </div>
      } @else {
        <kd-empty title="Nothing to check out" text="Your cart is empty. Add an item to place an order.">
          <a routerLink="/shop" class="btn btn-primary">Browse products</a>
        </kd-empty>
      }
    </div>`,
})
export class CheckoutPage {
  auth = inject(AuthService);
  private cart = inject(CartService);
  private catalog = inject(CatalogService);
  private orders = inject(OrderService);
  private router = inject(Router);
  private params = toSignal(inject(ActivatedRoute).queryParamMap, { requireSync: true });

  methods: { id: PaymentMethod; label: string; note: string }[] = [
    { id: 'upi', label: 'UPI', note: 'Pay from any UPI app' },
    { id: 'card', label: 'Credit or debit card', note: 'Visa, Mastercard, RuPay' },
    { id: 'netbanking', label: 'Net banking', note: 'All major banks' },
    { id: 'cod', label: 'Cash on delivery', note: 'Pay when it arrives' },
  ];
  banks = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Canara Bank', 'Indian Bank'];
  method = signal<PaymentMethod>('upi');
  upi = ''; card = ''; exp = ''; cvv = ''; bank = '';
  payError = signal('');
  addrError = signal('');
  adding = signal(false);
  selectedId = signal<string | null>(null);

  buyNowId = computed(() => +(this.params().get('buy') ?? 0));
  items = computed<CartItem[]>(() => {
    const product = this.catalog.get(this.buyNowId());
    if (product && product.stock > 0) {
      const qty = Math.min(Math.max(1, +(this.params().get('qty') ?? 1) || 1), this.cart.limit(product.id));
      return [{ product, qty }];
    }
    return this.cart.items();
  });
  totals = computed(() => totalsFor(this.items()));
  addressId = computed(() => {
    const list = this.auth.addresses();
    const sel = this.selectedId();
    return list.some((a) => a.id === sel) ? sel : (list.find((a) => a.isDefault) ?? list[0])?.id ?? null;
  });

  private paymentLabel(): string | null {
    switch (this.method()) {
      case 'upi':
        if (!/^[\w.-]+@[\w.-]+$/.test(this.upi.trim())) { this.payError.set('Enter a UPI ID like name@bank.'); return null; }
        return 'UPI';
      case 'card': {
        const n = this.card.replace(/\D/g, '');
        if (n.length < 15 || n.length > 16) { this.payError.set('Enter a valid card number.'); return null; }
        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(this.exp.trim())) { this.payError.set('Enter the expiry as MM/YY.'); return null; }
        if (!/^\d{3,4}$/.test(this.cvv)) { this.payError.set('Enter the 3 or 4 digit CVV.'); return null; }
        return 'Card ending ' + n.slice(-4);
      }
      case 'netbanking':
        if (!this.bank) { this.payError.set('Select your bank.'); return null; }
        return 'Net banking, ' + this.bank;
      default:
        return 'Cash on delivery';
    }
  }

  place() {
    this.payError.set('');
    if (this.items().some((i) => i.qty > i.product.stock)) {
      this.addrError.set('An item in this order no longer has enough stock. Update your cart and try again.');
      return;
    }
    const address = this.auth.addresses().find((a) => a.id === this.addressId());
    this.addrError.set(address ? '' : 'Save a delivery address to place this order.');
    const payment = this.paymentLabel();
    if (!address) return;
    if (!payment) { this.addrError.set('Check the payment details above.'); return; }
    const order = this.orders.place(this.items(), this.totals(), address, payment);
    this.card = this.cvv = this.exp = '';
    if (this.buyNowId() && this.catalog.get(this.buyNowId())) {
      /* Buy now leaves the rest of the cart untouched. */
    } else {
      this.cart.clear();
    }
    this.router.navigate(['/order', order.id], { replaceUrl: true });
  }
}

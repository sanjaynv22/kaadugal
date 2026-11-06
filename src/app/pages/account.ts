import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AddressForm } from '../components/address-form';
import { EmptyState, ImgFallback, InrPipe } from '../components/ui';
import { Address } from '../models';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'kd-account',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="page py-4">
      <div class="grid md:grid-cols-[210px_minmax(0,1fr)] gap-4 items-start">
        <nav class="panel p-2 flex md:flex-col gap-0.5 overflow-x-auto no-scrollbar" aria-label="Your account">
          @for (t of tabs; track t.path) {
            <a [routerLink]="t.path" routerLinkActive="!bg-forest !text-white" class="shrink-0 rounded px-3 py-2 font-medium hover:bg-cream">{{ t.label }}</a>
          }
          <button type="button" class="shrink-0 text-left rounded px-3 py-2 font-medium hover:bg-cream" (click)="logout()">Sign out</button>
        </nav>
        <div class="min-w-0"><router-outlet /></div>
      </div>
    </div>`,
})
export class AccountLayout {
  private auth = inject(AuthService);
  private router = inject(Router);
  tabs = [
    { path: 'profile', label: 'Profile' }, { path: 'orders', label: 'Orders' },
    { path: 'addresses', label: 'Addresses' }, { path: 'wishlist', label: 'Wishlist' },
  ];
  logout() { this.auth.logout(); this.router.navigateByUrl('/'); }
}

@Component({
  selector: 'kd-profile',
  imports: [FormsModule],
  template: `
    <h1 class="text-[24px] font-bold mb-3">Your profile</h1>
    <form class="panel p-4 max-w-lg space-y-3" (submit)="$event.preventDefault(); save()">
      <div><label class="field-label" for="p-name">Full name</label><input id="p-name" name="name" class="field" [(ngModel)]="name" /></div>
      <div><label class="field-label" for="p-email">Email</label><input id="p-email" name="email" class="field !bg-cream" [value]="auth.user()?.email" disabled /></div>
      <div><label class="field-label" for="p-phone">Mobile number</label><input id="p-phone" name="phone" inputmode="numeric" maxlength="10" class="field" [(ngModel)]="phone" /></div>
      @if (error()) { <p class="field-error" role="alert">{{ error() }}</p> }
      <button class="btn btn-primary">Save changes</button>
    </form>`,
})
export class ProfileTab {
  auth = inject(AuthService);
  private toast = inject(ToastService);
  name = this.auth.user()?.name ?? '';
  phone = this.auth.user()?.phone ?? '';
  error = signal('');
  save() {
    if (!this.name.trim()) return this.error.set('Enter your name.');
    if (this.phone && !/^[6-9]\d{9}$/.test(this.phone)) return this.error.set('Enter a 10-digit mobile number.');
    this.error.set('');
    this.auth.updateProfile(this.name, this.phone);
    this.toast.show({ text: 'Changes saved' });
  }
}

@Component({
  selector: 'kd-orders',
  imports: [RouterLink, DatePipe, EmptyState, ImgFallback, InrPipe],
  template: `
    <h1 class="text-[24px] font-bold mb-3">Your orders</h1>
    @for (o of orders.mine(); track o.id) {
      <section class="panel mb-3">
        <header class="flex flex-wrap gap-x-6 gap-y-1 bg-cream-deep/60 px-4 py-2.5 text-[13px] rounded-t-md">
          <div><span class="text-ink-soft block">Placed</span>{{ o.placedAt | date: 'd MMM y' }}</div>
          <div><span class="text-ink-soft block">Total</span>{{ o.totals.total | inr }}</div>
          <div class="min-w-0"><span class="text-ink-soft block">Deliver to</span>{{ o.address.name }}, {{ o.address.city }}</div>
          <div class="sm:ml-auto"><span class="text-ink-soft block">Order number</span>{{ o.id }}</div>
        </header>
        <div class="px-4 py-3">
          <p class="font-bold" [class.text-sale]="o.status === 'Cancelled'">{{ o.status === 'Cancelled' ? 'Cancelled' : o.status === 'Delivered' ? 'Delivered' : (o.status === 'Shipped' ? 'Shipped, arriving by ' : 'Arriving by ') + (o.deliverBy | date: 'EEE, d MMM') }}</p>
          <ul class="mt-1 divide-y divide-cream-deep">
            @for (l of o.lines; track l.productId) {
              <li class="flex flex-wrap items-center gap-3 py-2">
                <img kdImg [src]="l.thumb" [alt]="l.title" class="w-14 h-14 object-contain shrink-0" />
                <a [routerLink]="['/product', l.slug]" class="flex-1 min-w-[10rem] font-medium hover:text-forest-soft">{{ l.title }} <span class="text-ink-soft font-normal">× {{ l.qty }}</span></a>
                <button type="button" class="btn btn-outline !py-1 text-[13px]" (click)="again(l.productId, l.qty)">Buy again</button>
              </li>
            }
          </ul>
          @if (o.status === 'Confirmed') { <button type="button" class="link text-[13px] mt-1" (click)="orders.cancel(o.id)">Cancel order</button> }
        </div>
      </section>
    } @empty {
      <kd-empty title="No orders yet" text="Orders you place will appear here.">
        <a routerLink="/shop" class="btn btn-primary">Start shopping</a>
      </kd-empty>
    }`,
})
export class OrdersTab {
  orders = inject(OrderService);
  private cart = inject(CartService);
  private toast = inject(ToastService);
  again(id: number, qty: number) {
    this.cart.add(id, qty);
    this.toast.show({ text: 'Added to cart', link: '/cart', linkText: 'View cart' });
  }
}

@Component({
  selector: 'kd-addresses',
  imports: [AddressForm, EmptyState],
  template: `
    <div class="flex items-center justify-between mb-3">
      <h1 class="text-[24px] font-bold">Saved addresses</h1>
      @if (!editing() && !adding()) { <button type="button" class="btn btn-primary" (click)="adding.set(true)">Add address</button> }
    </div>
    @if (adding() || editing()) {
      <div class="panel p-4 mb-3"><kd-address-form [initial]="editing()" (saved)="close()" (cancelled)="close()" /></div>
    }
    <ul class="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
      @for (a of auth.addresses(); track a.id) {
        <li class="panel p-4 flex flex-col">
          @if (a.isDefault) { <span class="self-start text-[11px] font-semibold bg-sage-soft text-forest px-1.5 py-0.5 rounded mb-1.5">Default</span> }
          <p class="flex-1"><span class="font-semibold">{{ a.name }}</span><br />{{ a.line1 }}{{ a.line2 ? ', ' + a.line2 : '' }}<br />{{ a.city }}, {{ a.state }} {{ a.pincode }}<br />{{ a.phone }}</p>
          <div class="flex flex-wrap gap-3 mt-2 text-[13px]">
            <button type="button" class="link" (click)="editing.set(a); adding.set(false)">Edit</button>
            <button type="button" class="link" (click)="auth.removeAddress(a.id)">Remove</button>
            @if (!a.isDefault) { <button type="button" class="link" (click)="auth.setDefault(a.id)">Set as default</button> }
          </div>
        </li>
      }
    </ul>
    @if (!auth.addresses().length && !adding()) {
      <kd-empty title="No saved addresses" text="Add one to check out faster." />
    }`,
})
export class AddressesTab {
  auth = inject(AuthService);
  adding = signal(false);
  editing = signal<Address | null>(null);
  close() { this.adding.set(false); this.editing.set(null); }
}

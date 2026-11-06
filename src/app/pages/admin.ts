import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { EmptyState, ImgFallback, InrPipe, Logo } from '../components/ui';
import { OrderStatus } from '../models';
import { AdminService, DEMO_ADMIN } from '../services/admin.service';
import { AuthService } from '../services/auth.service';
import { CatalogService } from '../services/catalog.service';
import { OrderService } from '../services/order.service';

export const LOW_STOCK = 10;
const STATUSES: OrderStatus[] = ['Confirmed', 'Shipped', 'Delivered', 'Cancelled'];

@Component({
  selector: 'kd-admin-login',
  imports: [FormsModule, RouterLink, Logo],
  template: `
    <div class="on-dark min-h-screen bg-forest grid place-items-center p-4">
      <main class="w-full max-w-[400px]">
        <div class="mb-4 text-center"><kd-logo /></div>
        <div class="on-light bg-white text-ink rounded-md p-6">
          <h1 class="text-[24px] font-bold">Admin sign-in</h1>
          <form class="mt-3 space-y-3" (submit)="$event.preventDefault(); submit()" novalidate>
            <div><label class="field-label" for="ad-email">Email</label><input id="ad-email" name="email" type="email" autocomplete="username" class="field" [(ngModel)]="email" /></div>
            <div><label class="field-label" for="ad-pw">Password</label><input id="ad-pw" name="pw" type="password" autocomplete="current-password" class="field" [(ngModel)]="password" /></div>
            @if (error()) { <p class="field-error" role="alert">{{ error() }}</p> }
            <button class="btn btn-primary w-full">Sign in to admin</button>
          </form>
          <p class="text-[12.5px] text-ink-soft mt-3">Demo admin: {{ demo.email }}, password {{ demo.password }}</p>
          <hr class="border-line my-3" />
          <a routerLink="/" class="link">Back to the store</a>
        </div>
      </main>
    </div>`,
})
export class AdminLogin {
  returnUrl = input<string>();
  private admin = inject(AdminService);
  private router = inject(Router);
  demo = DEMO_ADMIN;
  email = '';
  password = '';
  error = signal('');

  constructor() {
    if (this.admin.signedIn()) this.router.navigateByUrl('/admin');
  }
  submit() {
    if (!this.admin.login(this.email, this.password)) return this.error.set('That email and password don\'t match an admin account.');
    this.router.navigateByUrl(this.returnUrl() || '/admin');
  }
}

@Component({
  selector: 'kd-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, Logo],
  template: `
    <div class="min-h-screen md:grid md:grid-cols-[210px_minmax(0,1fr)]">
      <aside class="on-dark bg-forest text-white md:sticky md:top-0 md:h-screen flex flex-col">
        <a routerLink="/admin" class="px-4 pt-3 pb-2 md:pt-4 md:pb-1 block" aria-label="Admin dashboard"><kd-logo /></a>
        <p class="hidden md:block px-4 text-[13px] text-sage mb-3">Admin</p>
        <nav class="flex md:flex-col gap-0.5 px-2 pb-2 overflow-x-auto no-scrollbar" aria-label="Admin">
          @for (t of tabs; track t.path) {
            <a [routerLink]="t.path" routerLinkActive="!bg-forest-soft font-semibold" [routerLinkActiveOptions]="{ exact: t.exact }" class="shrink-0 rounded px-3 py-2 hover:bg-forest-soft">{{ t.label }}</a>
          }
          <a routerLink="/" class="md:hidden shrink-0 rounded px-3 py-2 hover:bg-forest-soft">View store</a>
          <button type="button" class="md:hidden shrink-0 rounded px-3 py-2 hover:bg-forest-soft" (click)="logout()">Sign out</button>
        </nav>
        <div class="hidden md:flex flex-col gap-0.5 mt-auto p-2 border-t border-forest-soft">
          <a routerLink="/" class="rounded px-3 py-2 hover:bg-forest-soft">View store</a>
          <button type="button" class="text-left rounded px-3 py-2 hover:bg-forest-soft" (click)="logout()">Sign out</button>
        </div>
      </aside>
      <main id="main" class="min-w-0 p-4 lg:p-6"><div class="max-w-[1200px] mx-auto"><router-outlet /></div></main>
    </div>`,
})
export class AdminLayout {
  private admin = inject(AdminService);
  private router = inject(Router);
  tabs = [
    { path: '/admin', label: 'Dashboard', exact: true }, { path: '/admin/products', label: 'Products', exact: false },
    { path: '/admin/orders', label: 'Orders', exact: false }, { path: '/admin/customers', label: 'Customers', exact: false },
  ];
  logout() { this.admin.logout(); this.router.navigateByUrl('/admin/login'); }
}

@Component({
  selector: 'kd-admin-dashboard',
  imports: [RouterLink, DatePipe, InrPipe, ImgFallback],
  template: `
    <h1 class="text-[24px] font-bold">Dashboard</h1>
    <p class="text-ink-soft mb-3">Sales and customers recorded in this browser.</p>
    <dl class="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
      <div class="panel p-4"><dt class="text-ink-soft text-[13px]">Sales</dt><dd class="font-display font-bold text-[28px] leading-tight tabular-nums">{{ revenue() | inr }}</dd><dd class="text-xs text-ink-soft">Cancelled orders not counted</dd></div>
      <div class="panel p-4"><dt class="text-ink-soft text-[13px]">Orders</dt><dd class="font-display font-bold text-[28px] leading-tight tabular-nums">{{ orders.all().length }}</dd><dd class="text-xs text-ink-soft">{{ toShip() }} to ship</dd></div>
      <div class="panel p-4"><dt class="text-ink-soft text-[13px]">Customers</dt><dd class="font-display font-bold text-[28px] leading-tight tabular-nums">{{ auth.customers().length }}</dd><dd class="text-xs text-ink-soft">Registered accounts</dd></div>
      <div class="panel p-4"><dt class="text-ink-soft text-[13px]">Products</dt><dd class="font-display font-bold text-[28px] leading-tight tabular-nums">{{ catalog.products.length }}</dd><dd class="text-xs text-ink-soft">{{ lowStock().length }} low on stock</dd></div>
    </dl>
    <div class="grid lg:grid-cols-2 gap-3 mt-3 items-start">
      <section class="panel p-4" aria-labelledby="recent">
        <div class="flex justify-between items-baseline mb-1"><h2 id="recent" class="text-lg font-bold">Recent orders</h2><a routerLink="/admin/orders" class="link text-[13px]">See all</a></div>
        <ul class="divide-y divide-cream-deep">
          @for (o of recent(); track o.id) {
            <li class="flex flex-wrap justify-between gap-x-3 py-2">
              <span class="min-w-0"><span class="font-semibold">{{ o.id }}</span><br /><span class="text-[13px] text-ink-soft">{{ o.address.name }}, {{ o.placedAt | date: 'd MMM' }}</span></span>
              <span class="text-right"><span class="font-semibold tabular-nums">{{ o.totals.total | inr }}</span><br /><span class="text-[13px]">{{ o.status }}</span></span>
            </li>
          } @empty { <li class="py-3 text-ink-soft">Orders customers place will appear here.</li> }
        </ul>
      </section>
      <section class="panel p-4" aria-labelledby="low">
        <div class="flex justify-between items-baseline mb-1"><h2 id="low" class="text-lg font-bold">Low stock</h2><span class="text-[13px] text-ink-soft">Under {{ threshold }} units</span></div>
        <ul class="divide-y divide-cream-deep">
          @for (p of lowStock().slice(0, 8); track p.id) {
            <li class="flex items-center gap-3 py-1.5">
              <img kdImg [src]="p.thumb" [alt]="p.title" class="w-10 h-10 object-contain shrink-0" />
              <a [routerLink]="['/admin/products', p.id]" class="flex-1 min-w-0 truncate font-medium hover:text-forest-soft">{{ p.title }}</a>
              <span class="tabular-nums font-semibold" [class.text-sale]="p.stock === 0">{{ p.stock === 0 ? 'Out of stock' : p.stock + ' left' }}</span>
            </li>
          } @empty { <li class="py-3 text-ink-soft">All products have enough stock.</li> }
        </ul>
      </section>
    </div>`,
})
export class AdminDashboard {
  catalog = inject(CatalogService);
  orders = inject(OrderService);
  auth = inject(AuthService);
  threshold = LOW_STOCK;
  revenue = computed(() => this.orders.all().filter((o) => o.status !== 'Cancelled').reduce((s, o) => s + o.totals.total, 0));
  toShip = computed(() => this.orders.all().filter((o) => o.status === 'Confirmed').length);
  recent = computed(() => this.orders.all().slice(0, 6));
  lowStock = computed(() => this.catalog.products.filter((p) => p.stock < LOW_STOCK).sort((a, b) => a.stock - b.stock));
}

@Component({
  selector: 'kd-admin-orders',
  imports: [DatePipe, FormsModule, InrPipe, EmptyState],
  template: `
    <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
      <h1 class="text-[24px] font-bold">Orders</h1>
      <label class="flex items-center gap-2 text-[13px]">Status
        <select class="field !w-auto !py-1.5" [ngModel]="filter()" (ngModelChange)="filter.set($event)">
          <option value="">All ({{ orders.all().length }})</option>
          @for (s of statuses; track s) { <option [value]="s">{{ s }} ({{ count(s) }})</option> }
        </select>
      </label>
    </div>
    @for (o of shown(); track o.id) {
      <article class="panel p-4 mb-2.5">
        <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div class="min-w-0"><h2 class="font-sans font-bold text-[15px]">{{ o.id }}</h2>
            <p class="text-[13px] text-ink-soft">{{ o.placedAt | date: 'd MMM y, h:mm a' }}, {{ o.email }}</p></div>
          <div class="flex items-center gap-3">
            <span class="font-bold text-[16px] tabular-nums">{{ o.totals.total | inr }}</span>
            @if (o.status === 'Cancelled') {
              <span class="font-semibold text-sale">Cancelled</span>
            } @else {
              <select class="field !w-auto !py-1.5" [attr.aria-label]="'Status of order ' + o.id" [ngModel]="o.status" (ngModelChange)="orders.setStatus(o.id, $event)">
                @for (s of statuses; track s) { <option [value]="s">{{ s }}</option> }
              </select>
            }
          </div>
        </div>
        <ul class="mt-2 text-[13.5px]">
          @for (l of o.lines; track l.productId) { <li>{{ l.qty }} × {{ l.title }}</li> }
        </ul>
        <p class="text-[13px] text-ink-soft mt-1.5">{{ o.address.name }}, {{ o.address.phone }}, {{ o.address.line1 }}, {{ o.address.city }}, {{ o.address.state }} {{ o.address.pincode }}. Paid by {{ o.payment }}.</p>
      </article>
    } @empty {
      <kd-empty title="No orders here" [text]="filter() ? 'No orders have this status.' : 'Orders customers place will appear here.'" />
    }`,
})
export class AdminOrders {
  orders = inject(OrderService);
  statuses = STATUSES;
  filter = signal('');
  shown = computed(() => this.orders.all().filter((o) => !this.filter() || o.status === this.filter()));
  count(s: OrderStatus) { return this.orders.all().filter((o) => o.status === s).length; }
}

@Component({
  selector: 'kd-admin-customers',
  imports: [InrPipe, EmptyState],
  template: `
    <h1 class="text-[24px] font-bold mb-3">Customers</h1>
    @if (rows().length) {
      <div class="panel overflow-x-auto">
        <table class="w-full text-left min-w-[560px]">
          <thead class="text-[13px] text-ink-soft"><tr class="border-b border-line">
            <th scope="col" class="p-3 font-medium">Name</th><th scope="col" class="p-3 font-medium">Email</th><th scope="col" class="p-3 font-medium">Mobile</th>
            <th scope="col" class="p-3 font-medium text-right">Orders</th><th scope="col" class="p-3 font-medium text-right">Spent</th></tr></thead>
          <tbody>
            @for (r of rows(); track r.email) {
              <tr class="border-b border-cream-deep last:border-0">
                <td class="p-3 font-medium">{{ r.name }}</td><td class="p-3">{{ r.email }}</td><td class="p-3">{{ r.phone || 'Not given' }}</td>
                <td class="p-3 text-right tabular-nums">{{ r.orders }}</td><td class="p-3 text-right tabular-nums">{{ r.spent | inr }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <kd-empty title="No customers yet" text="Accounts created in the store will appear here." />
    }`,
})
export class AdminCustomers {
  private auth = inject(AuthService);
  private orders = inject(OrderService);
  rows = computed(() => this.auth.customers().map((u) => {
    const mine = this.orders.all().filter((o) => o.email === u.email && o.status !== 'Cancelled');
    return { ...u, orders: mine.length, spent: mine.reduce((s, o) => s + o.totals.total, 0) };
  }));
}

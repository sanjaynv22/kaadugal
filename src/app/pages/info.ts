import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { EmptyState } from '../components/ui';
import { ToastService } from '../services/toast.service';

const PAGES: Record<string, { title: string; html: string }> = {
  about: { title: 'About KAADUGAL', html: `<p>Kaadugal means forests in Tamil. We named the store after them because a forest holds a bit of everything, and so do we: electronics, phones, fashion, home and kitchen, beauty, books, sports, grocery, toys and furniture, all in one cart.</p><h2>What we care about</h2><ul><li>Prices you can compare, with the MRP and discount always shown.</li><li>Delivery dates shown before you pay.</li><li>Returns that are simple to start.</li></ul>` },
  help: { title: 'Help centre', html: `<h2>Delivery</h2><p>Most orders arrive within 3 to 5 days. Delivery is free on orders from ₹499, and ₹49 below that.</p><h2>Tracking an order</h2><p>Open <a href="/account/orders">Your orders</a> to see the expected delivery date of every order.</p><h2>Cancelling an order</h2><p>Open Your orders and choose Cancel order on any order that has not been delivered.</p><h2>Payment</h2><p>We accept UPI, credit and debit cards, net banking and cash on delivery.</p>` },
  returns: { title: 'Returns and refunds', html: `<p>The return window for each item is shown on its product page.</p><h2>How to return an item</h2><ul><li>Open Your orders and find the item.</li><li>Keep the item unused, with its tags and original packaging.</li><li>We collect it from your delivery address.</li></ul><h2>Refunds</h2><p>Refunds go to your original payment method within 5 to 7 business days after we receive the item. Cash on delivery orders are refunded to your bank account.</p><h2>Items that can't be returned</h2><p>Fresh grocery items, opened beauty products and any item marked "No return policy".</p>` },
  privacy: { title: 'Privacy policy', html: `<p>This policy explains what information KAADUGAL handles.</p><h2>What we collect</h2><p>In this version of the store, your account, addresses, cart, wishlist and orders are saved only in your browser's local storage. Nothing is sent to a server. Card numbers and CVVs are never saved.</p><h2>Removing your data</h2><p>Clear this site's data in your browser to remove everything.</p>` },
  terms: { title: 'Terms and conditions', html: `<p>By using KAADUGAL you agree to these terms.</p><h2>Orders</h2><p>Orders placed in this version of the store are demonstrations. No payment is taken and no goods are shipped.</p><h2>Product information</h2><p>We try to keep product details and prices accurate, but sample data may not reflect real products, prices or availability.</p><h2>Accounts</h2><p>You are responsible for activity on your account in your browser.</p>` },
};

@Component({
  selector: 'kd-info',
  imports: [FormsModule, EmptyState, RouterLink],
  template: `
    <div class="page py-6 max-w-[860px]">
      @if (page() === 'contact') {
        <h1 class="text-[26px] font-bold mb-3">Contact</h1>
        <div class="grid md:grid-cols-[1fr_260px] gap-4 items-start">
          <form class="panel p-4 space-y-3" (submit)="$event.preventDefault(); send()">
            <div><label class="field-label" for="c-name">Name</label><input id="c-name" name="n" class="field" [(ngModel)]="name" /></div>
            <div><label class="field-label" for="c-email">Email</label><input id="c-email" name="e" type="email" class="field" [(ngModel)]="email" /></div>
            <div><label class="field-label" for="c-msg">How can we help?</label><textarea id="c-msg" name="m" rows="5" class="field" [(ngModel)]="message"></textarea></div>
            @if (error()) { <p class="field-error" role="alert">{{ error() }}</p> }
            <button class="btn btn-primary">Send message</button>
          </form>
          <div class="panel p-4">
            <h2 class="font-bold text-[16px] mb-1">Customer care</h2>
            <p>support&#64;kaadugal.example<br />Every day, 8 am to 10 pm</p>
          </div>
        </div>
      } @else if (content(); as c) {
        <h1 class="text-[26px] font-bold mb-3">{{ c.title }}</h1>
        <article class="panel p-5 prose-k" [innerHTML]="c.html"></article>
      } @else {
        <kd-empty title="Page not found" text="This page doesn't exist."><a routerLink="/" class="btn btn-primary">Go to the home page</a></kd-empty>
      }
    </div>`,
})
export class InfoPage {
  page = input.required<string>();
  private title = inject(Title);
  private toast = inject(ToastService);
  content = computed(() => PAGES[this.page()]);
  name = ''; email = ''; message = '';
  error = signal('');
  constructor() {
    effect(() => this.title.setTitle((this.page() === 'contact' ? 'Contact' : this.content()?.title ?? 'Page not found') + ' | KAADUGAL'));
  }
  send() {
    if (!this.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email) || !this.message.trim()) return this.error.set('Fill in your name, a valid email and your message.');
    this.error.set('');
    this.name = this.email = this.message = '';
    this.toast.show({ text: 'Message sent' });
  }
}

@Component({
  selector: 'kd-not-found',
  imports: [EmptyState, RouterLink],
  template: `<div class="page py-8"><kd-empty title="Page not found" text="This link is broken or the page has moved."><a routerLink="/" class="btn btn-primary">Go to the home page</a></kd-empty></div>`,
})
export class NotFoundPage {}

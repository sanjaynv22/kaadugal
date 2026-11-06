import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { ToastService } from './services/toast.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Header, Footer],
  template: `
    <a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-2">Skip to content</a>
    @if (adminArea()) {
      <router-outlet />
    } @else {
      <div class="min-h-screen flex flex-col">
        <kd-header />
        <main id="main" class="flex-1"><router-outlet /></main>
        <kd-footer />
      </div>
    }
    @if (toast.current(); as t) {
      <div role="status" class="on-dark fixed z-50 bottom-4 left-4 right-4 sm:left-auto sm:max-w-sm flex items-center gap-3 bg-ink text-white rounded-md px-4 py-3 shadow-lg">
        <span class="flex-1 line-clamp-2">{{ t.text }}</span>
        @if (t.link) { <a [routerLink]="t.link" (click)="toast.dismiss()" class="font-semibold text-[#F4D9A0] whitespace-nowrap hover:underline">{{ t.linkText }}</a> }
      </div>
    }`,
})
export class App {
  toast = inject(ToastService);
  adminArea = signal(location.pathname.startsWith('/admin'));

  constructor() {
    inject(Router).events.subscribe((e) => {
      if (e instanceof NavigationEnd) this.adminArea.set(e.urlAfterRedirects.startsWith('/admin'));
    });
  }
}

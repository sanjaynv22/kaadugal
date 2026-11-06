import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from './ui';

@Component({
  selector: 'kd-footer',
  imports: [RouterLink, Logo],
  template: `
    <footer class="on-dark mt-10 bg-forest text-white">
      <button type="button" (click)="top()" class="w-full py-2.5 bg-forest-soft hover:bg-[#2C6856] text-[13px] font-semibold">Back to top</button>
      <div class="page py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div class="col-span-2 md:col-span-1">
          <kd-logo />
          <p class="mt-2 text-sage-soft max-w-[32ch]">Kaadugal means forests in Tamil. Like a forest, this store has a bit of everything, all in one place.</p>
        </div>
        <div>
          <h2 class="font-sans text-[14px] font-bold mb-2">Company</h2>
          <ul class="space-y-1.5 text-sage-soft">
            <li><a routerLink="/info/about" class="hover:underline hover:text-white">About KAADUGAL</a></li>
            <li><a routerLink="/info/contact" class="hover:underline hover:text-white">Contact</a></li>
            <li><a routerLink="/shop" [queryParams]="{ deals: 1 }" class="hover:underline hover:text-white">Today's offers</a></li>
          </ul>
        </div>
        <div>
          <h2 class="font-sans text-[14px] font-bold mb-2">Customer service</h2>
          <ul class="space-y-1.5 text-sage-soft">
            <li><a routerLink="/info/help" class="hover:underline hover:text-white">Help centre</a></li>
            <li><a routerLink="/account/orders" class="hover:underline hover:text-white">Your orders</a></li>
            <li><a routerLink="/info/returns" class="hover:underline hover:text-white">Returns and refunds</a></li>
          </ul>
        </div>
        <div>
          <h2 class="font-sans text-[14px] font-bold mb-2">Follow us</h2>
          <ul class="flex gap-2 mb-3">
            @for (s of socials; track s.name) {
              <li><a [href]="s.url" target="_blank" rel="noopener noreferrer" [attr.aria-label]="s.name" class="w-9 h-9 grid place-items-center rounded border border-forest-soft hover:bg-forest-soft">
                <svg viewBox="0 0 24 24" class="w-[18px] h-[18px] fill-current" aria-hidden="true"><path [attr.d]="s.icon" /></svg></a></li>
            }
          </ul>
        </div>
      </div>
      <div class="bg-forest-deep">
        <div class="page py-3 flex flex-wrap gap-x-4 gap-y-1 items-center text-[13px] text-sage-soft">
          <span>© {{ year }} KAADUGAL</span>
          <a routerLink="/info/privacy" class="hover:underline hover:text-white">Privacy policy</a>
          <a routerLink="/info/terms" class="hover:underline hover:text-white">Terms and conditions</a>
          <a routerLink="/admin" class="hover:underline hover:text-white sm:ml-auto">Admin sign-in</a>
        </div>
      </div>
    </footer>`,
})
export class Footer {
  year = new Date().getFullYear();
  socials = [
    { name: 'Instagram', url: 'https://www.instagram.com/', icon: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.500a4.500 4.500 0 1 1 0 9 4.500 4.500 0 0 1 0-9zm0 2a2.500 2.500 0 1 0 0 5 2.500 2.500 0 0 0 0-5zM17.300 5.600a1.100 1.100 0 1 1 0 2.200 1.100 1.100 0 0 1 0-2.200z' },
    { name: 'Facebook', url: 'https://www.facebook.com/', icon: 'M14 8.500V6.800c0-.8.500-1 1-1h2V2h-3c-3 0-4.500 2-4.500 4.500v2H7V12h2.500v10H14V12h2.700l.5-3.500H14z' },
    { name: 'X', url: 'https://x.com/', icon: 'M17.500 3h3.100l-6.800 7.800 8 10.200h-6.300l-4.900-6.400L5 21H1.900l7.300-8.300L1.500 3H8l4.400 5.800L17.500 3zm-1.100 16.200h1.700L7.200 4.700H5.400l11 14.500z' },
    { name: 'YouTube', url: 'https://www.youtube.com/', icon: 'M22 7.500a3 3 0 0 0-2.100-2.100C18 5 12 5 12 5s-6 0-7.900.4A3 3 0 0 0 2 7.500 31 31 0 0 0 1.700 12 31 31 0 0 0 2 16.500a3 3 0 0 0 2.100 2.100C6 19 12 19 12 19s6 0 7.900-.4a3 3 0 0 0 2.100-2.100 31 31 0 0 0 .3-4.500 31 31 0 0 0-.3-4.500zM10 15V9l5.200 3-5.200 3z' },
  ];
  top() { window.scrollTo({ top: 0 }); }
}

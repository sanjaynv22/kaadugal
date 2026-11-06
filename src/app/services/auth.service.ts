import { Injectable, computed, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Address, User } from '../models';
import { load, save } from './storage';

/** Demo authentication kept in this browser. Passwords are never stored. */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private users = signal<User[]>(load('users', []));
  readonly customers = this.users.asReadonly();
  private allAddresses = signal<Record<string, Address[]>>(load('addresses', {}));
  readonly user = signal<User | null>(load('session', null));
  readonly loggedIn = computed(() => !!this.user());
  readonly firstName = computed(() => this.user()?.name.split(' ')[0] ?? '');
  readonly addresses = computed(() => this.allAddresses()[this.user()?.email ?? ''] ?? []);

  private setSession(u: User | null) { this.user.set(u); save('session', u); }

  register(name: string, email: string, phone?: string): string | null {
    const key = email.trim().toLowerCase();
    if (this.users().some((u) => u.email === key)) return 'An account with this email already exists. Sign in instead.';
    const user: User = { name: name.trim(), email: key, phone };
    this.users.update((l) => [...l, user]);
    save('users', this.users());
    this.setSession(user);
    return null;
  }

  login(email: string): string | null {
    const user = this.users().find((u) => u.email === email.trim().toLowerCase());
    if (!user) return 'No account uses this email. Check it or create an account.';
    this.setSession(user);
    return null;
  }

  loginDemo() {
    const email = 'demo@kaadugal.example';
    if (!this.users().some((u) => u.email === email)) {
      this.register('Demo Shopper', email, '9876543210');
      this.saveAddress({ id: 'demo-home', name: 'Demo Shopper', phone: '9876543210', line1: '14, Anna Salai', line2: 'Teynampet', city: 'Chennai', state: 'Tamil Nadu', pincode: '600018', isDefault: true });
    } else {
      this.login(email);
    }
  }

  logout() { this.setSession(null); }

  updateProfile(name: string, phone: string) {
    const u = this.user();
    if (!u) return;
    const next = { ...u, name: name.trim(), phone };
    this.users.update((l) => l.map((x) => (x.email === u.email ? next : x)));
    save('users', this.users());
    this.setSession(next);
  }

  private writeAddresses(list: Address[]) {
    const email = this.user()?.email;
    if (!email) return;
    this.allAddresses.update((all) => ({ ...all, [email]: list }));
    save('addresses', this.allAddresses());
  }

  saveAddress(a: Address) {
    let list = this.addresses();
    const first = !list.length;
    list = list.some((x) => x.id === a.id) ? list.map((x) => (x.id === a.id ? a : x)) : [...list, a];
    if (first || a.isDefault) list = list.map((x) => ({ ...x, isDefault: x.id === a.id }));
    this.writeAddresses(list);
  }

  removeAddress(id: string) {
    const list = this.addresses().filter((a) => a.id !== id);
    if (list.length && !list.some((a) => a.isDefault)) list[0] = { ...list[0], isDefault: true };
    this.writeAddresses(list);
  }

  setDefault(id: string) { this.writeAddresses(this.addresses().map((a) => ({ ...a, isDefault: a.id === id }))); }
}

export const authGuard: CanActivateFn = (_route, state) => {
  if (inject(AuthService).loggedIn()) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

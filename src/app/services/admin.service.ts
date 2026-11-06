import { Injectable, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { load, save } from './storage';

/**
 * Demo credentials. This check runs in the browser, so it separates the two
 * experiences but does not protect anything. Move it to a server before launch.
 */
export const DEMO_ADMIN = { email: 'admin@kaadugal.example', password: 'Admin@123' };

@Injectable({ providedIn: 'root' })
export class AdminService {
  readonly signedIn = signal<boolean>(load('adminSession', false));

  login(email: string, password: string): boolean {
    const ok = email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
    if (ok) this.set(true);
    return ok;
  }
  logout() { this.set(false); }
  private set(v: boolean) { this.signedIn.set(v); save('adminSession', v); }
}

export const adminGuard: CanActivateFn = (_route, state) => {
  if (inject(AdminService).signedIn()) return true;
  return inject(Router).createUrlTree(['/admin/login'], { queryParams: { returnUrl: state.url } });
};

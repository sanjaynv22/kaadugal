import { Component, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'kd-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page py-8 grid place-items-center">
      <div class="panel p-6 w-full max-w-[400px]">
        <h1 class="text-[24px] font-bold">Sign in</h1>
        <form class="mt-3 space-y-3" (submit)="$event.preventDefault(); submit()" novalidate>
          <div><label class="field-label" for="email">Email</label>
            <input id="email" name="email" type="email" autocomplete="email" class="field" [(ngModel)]="email" /></div>
          <div><label class="field-label" for="pw">Password</label>
            <input id="pw" name="pw" type="password" autocomplete="current-password" class="field" [(ngModel)]="password" /></div>
          @if (error()) { <p class="field-error" role="alert">{{ error() }}</p> }
          <button class="btn btn-primary w-full">Sign in</button>
        </form>
        <button type="button" class="btn btn-outline w-full mt-2" (click)="demo()">Continue with the demo account</button>
        <p class="text-[12.5px] text-ink-soft mt-3">Accounts in this demo stay in your browser. Passwords are not checked or saved.</p>
        <hr class="border-line my-3" />
        <p>New to KAADUGAL? <a routerLink="/register" [queryParams]="{ returnUrl: returnUrl() }" class="link">Create an account</a></p>
      </div>
    </div>`,
})
export class LoginPage {
  returnUrl = input<string>();
  private auth = inject(AuthService);
  private router = inject(Router);
  email = '';
  password = '';
  error = signal('');
  private done() { this.router.navigateByUrl(this.returnUrl() || '/'); }
  submit() {
    if (!EMAIL.test(this.email.trim()) || !this.password) return this.error.set('Enter your email and password.');
    const err = this.auth.login(this.email);
    if (err) return this.error.set(err);
    this.done();
  }
  demo() { this.auth.loginDemo(); this.done(); }
}

@Component({
  selector: 'kd-register',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="page py-8 grid place-items-center">
      <div class="panel p-6 w-full max-w-[400px]">
        <h1 class="text-[24px] font-bold">Create account</h1>
        <form class="mt-3 space-y-3" (submit)="$event.preventDefault(); submit()" novalidate>
          <div><label class="field-label" for="r-name">Full name</label><input id="r-name" name="name" autocomplete="name" class="field" [(ngModel)]="name" /></div>
          <div><label class="field-label" for="r-email">Email</label><input id="r-email" name="email" type="email" autocomplete="email" class="field" [(ngModel)]="email" /></div>
          <div><label class="field-label" for="r-phone">Mobile number (optional)</label><input id="r-phone" name="phone" inputmode="numeric" maxlength="10" autocomplete="tel-national" class="field" [(ngModel)]="phone" /></div>
          <div><label class="field-label" for="r-pw">Password</label><input id="r-pw" name="pw" type="password" autocomplete="new-password" class="field" [(ngModel)]="password" /><p class="text-xs text-ink-soft mt-0.5">At least 8 characters.</p></div>
          @if (error()) { <p class="field-error" role="alert">{{ error() }}</p> }
          <button class="btn btn-primary w-full">Create account</button>
        </form>
        <hr class="border-line my-3" />
        <p>Already have an account? <a routerLink="/login" [queryParams]="{ returnUrl: returnUrl() }" class="link">Sign in</a></p>
      </div>
    </div>`,
})
export class RegisterPage {
  returnUrl = input<string>();
  private auth = inject(AuthService);
  private router = inject(Router);
  name = ''; email = ''; phone = ''; password = '';
  error = signal('');
  submit() {
    if (!this.name.trim()) return this.error.set('Enter your name.');
    if (!EMAIL.test(this.email.trim())) return this.error.set('Enter a valid email, like name@example.com.');
    if (this.phone && !/^[6-9]\d{9}$/.test(this.phone)) return this.error.set('Enter a 10-digit mobile number, or leave it empty.');
    if (this.password.length < 8) return this.error.set('Use a password with at least 8 characters.');
    const err = this.auth.register(this.name, this.email, this.phone);
    if (err) return this.error.set(err);
    this.router.navigateByUrl(this.returnUrl() || '/');
  }
}

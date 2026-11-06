import { Component, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Address } from '../models';
import { AuthService } from '../services/auth.service';

const STATES = ['Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'];

@Component({
  selector: 'kd-address-form',
  imports: [FormsModule],
  template: `
    <form class="grid sm:grid-cols-2 gap-3" (submit)="$event.preventDefault(); submit()" novalidate>
      <div><label class="field-label" for="a-name">Full name</label>
        <input id="a-name" name="name" class="field" autocomplete="name" [class.invalid]="errors()['name']" [(ngModel)]="a.name" />
        @if (errors()['name']) { <p class="field-error">{{ errors()['name'] }}</p> }</div>
      <div><label class="field-label" for="a-phone">Mobile number</label>
        <input id="a-phone" name="phone" class="field" inputmode="numeric" maxlength="10" autocomplete="tel-national" [class.invalid]="errors()['phone']" [(ngModel)]="a.phone" />
        @if (errors()['phone']) { <p class="field-error">{{ errors()['phone'] }}</p> }</div>
      <div class="sm:col-span-2"><label class="field-label" for="a-l1">Address</label>
        <input id="a-l1" name="line1" class="field" autocomplete="address-line1" placeholder="House number, building, street" [class.invalid]="errors()['line1']" [(ngModel)]="a.line1" />
        @if (errors()['line1']) { <p class="field-error">{{ errors()['line1'] }}</p> }</div>
      <div class="sm:col-span-2"><label class="field-label" for="a-l2">Area or landmark (optional)</label>
        <input id="a-l2" name="line2" class="field" autocomplete="address-line2" [(ngModel)]="a.line2" /></div>
      <div><label class="field-label" for="a-city">City</label>
        <input id="a-city" name="city" class="field" autocomplete="address-level2" [class.invalid]="errors()['city']" [(ngModel)]="a.city" />
        @if (errors()['city']) { <p class="field-error">{{ errors()['city'] }}</p> }</div>
      <div class="grid grid-cols-2 gap-3">
        <div><label class="field-label" for="a-state">State</label>
          <select id="a-state" name="state" class="field" [class.invalid]="errors()['state']" [(ngModel)]="a.state">
            <option value="">Select</option>
            @for (s of states; track s) { <option [value]="s">{{ s }}</option> }
          </select>
          @if (errors()['state']) { <p class="field-error">{{ errors()['state'] }}</p> }</div>
        <div><label class="field-label" for="a-pin">Pincode</label>
          <input id="a-pin" name="pincode" class="field" inputmode="numeric" maxlength="6" autocomplete="postal-code" [class.invalid]="errors()['pincode']" [(ngModel)]="a.pincode" />
          @if (errors()['pincode']) { <p class="field-error">{{ errors()['pincode'] }}</p> }</div>
      </div>
      <div class="sm:col-span-2 flex gap-2">
        <button class="btn btn-primary">Save address</button>
        <button type="button" class="btn btn-outline" (click)="cancelled.emit()">Cancel</button>
      </div>
    </form>`,
})
export class AddressForm implements OnInit {
  initial = input<Address | null>(null);
  saved = output<Address>();
  cancelled = output<void>();
  states = STATES;
  private auth = inject(AuthService);
  errors = signal<Record<string, string>>({});
  a: Address = { id: '', name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' };

  ngOnInit() {
    const u = this.auth.user();
    this.a = this.initial() ? { ...this.initial()! } : { ...this.a, id: 'a' + Date.now(), name: u?.name ?? '', phone: u?.phone ?? '' };
  }

  submit() {
    const e: Record<string, string> = {};
    if (!this.a.name.trim()) e['name'] = 'Enter the full name.';
    if (!/^[6-9]\d{9}$/.test(this.a.phone.trim())) e['phone'] = 'Enter a 10-digit mobile number.';
    if (!this.a.line1.trim()) e['line1'] = 'Enter the street address.';
    if (!this.a.city.trim()) e['city'] = 'Enter the city.';
    if (!this.a.state) e['state'] = 'Select a state.';
    if (!/^[1-9]\d{5}$/.test(this.a.pincode.trim())) e['pincode'] = 'Enter 6 digits.';
    this.errors.set(e);
    if (Object.keys(e).length) return;
    this.auth.saveAddress(this.a);
    this.saved.emit(this.a);
  }
}

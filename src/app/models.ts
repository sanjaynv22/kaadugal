export interface Review { rating: number; comment: string; name: string; date: string; }

export interface Product {
  id: number; slug: string; title: string; brand: string;
  category: string; sub: string; description: string;
  price: number; mrp: number; disc: number;
  rating: number; ratingCount: number; popularity: number; trend: number; addedDaysAgo: number;
  stock: number; tags: string[]; sku: string; warranty: string; shipping: string; returns: string;
  thumb: string; images: string[]; reviews: Review[];
  deal?: boolean; label?: string; extra?: Record<string, string>;
}

export interface Category { slug: string; name: string; short: string; image: string; blurb: string; }
export interface CartLine { productId: number; qty: number; }
export interface CartItem { product: Product; qty: number; }
export interface Totals { mrp: number; discount: number; subtotal: number; delivery: number; total: number; count: number; }

export interface Address {
  id: string; name: string; phone: string; line1: string; line2?: string;
  city: string; state: string; pincode: string; isDefault?: boolean;
}

export interface User { name: string; email: string; phone?: string; }

export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cod';

export type OrderStatus = 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderLine { productId: number; title: string; thumb: string; price: number; qty: number; slug: string; }
export interface Order {
  id: string; email: string; placedAt: string; deliverBy: string; lines: OrderLine[];
  totals: Totals; address: Address; payment: string; status: OrderStatus;
}

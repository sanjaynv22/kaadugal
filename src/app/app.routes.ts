import { Routes } from '@angular/router';
import { adminGuard } from './services/admin.service';
import { authGuard } from './services/auth.service';

export const routes: Routes = [
  { path: '', pathMatch: 'full', title: 'KAADUGAL: Online shopping for everything', loadComponent: () => import('./pages/home').then((m) => m.HomePage) },
  { path: 'shop', title: 'Shop | KAADUGAL', loadComponent: () => import('./pages/listing').then((m) => m.ListingPage) },
  { path: 'product/:slug', title: 'Product | KAADUGAL', loadComponent: () => import('./pages/product').then((m) => m.ProductPage) },
  { path: 'cart', title: 'Your cart | KAADUGAL', loadComponent: () => import('./pages/cart').then((m) => m.CartPage) },
  { path: 'wishlist', title: 'Wishlist | KAADUGAL', loadComponent: () => import('./pages/wishlist').then((m) => m.WishlistPage) },
  { path: 'checkout', title: 'Checkout | KAADUGAL', canActivate: [authGuard], loadComponent: () => import('./pages/checkout').then((m) => m.CheckoutPage) },
  { path: 'order/:id', title: 'Order confirmed | KAADUGAL', canActivate: [authGuard], loadComponent: () => import('./pages/order-confirmation').then((m) => m.OrderConfirmationPage) },
  { path: 'login', title: 'Sign in | KAADUGAL', loadComponent: () => import('./pages/auth').then((m) => m.LoginPage) },
  { path: 'register', title: 'Create account | KAADUGAL', loadComponent: () => import('./pages/auth').then((m) => m.RegisterPage) },
  {
    path: 'account', canActivate: [authGuard],
    loadComponent: () => import('./pages/account').then((m) => m.AccountLayout),
    children: [
      { path: '', redirectTo: 'profile', pathMatch: 'full' },
      { path: 'profile', title: 'Your profile | KAADUGAL', loadComponent: () => import('./pages/account').then((m) => m.ProfileTab) },
      { path: 'orders', title: 'Your orders | KAADUGAL', loadComponent: () => import('./pages/account').then((m) => m.OrdersTab) },
      { path: 'addresses', title: 'Saved addresses | KAADUGAL', loadComponent: () => import('./pages/account').then((m) => m.AddressesTab) },
      { path: 'wishlist', title: 'Wishlist | KAADUGAL', loadComponent: () => import('./pages/wishlist').then((m) => m.WishlistPage) },
    ],
  },
  { path: 'admin/login', title: 'Admin sign-in | KAADUGAL', loadComponent: () => import('./pages/admin').then((m) => m.AdminLogin) },
  {
    path: 'admin', canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin').then((m) => m.AdminLayout),
    children: [
      { path: '', pathMatch: 'full', title: 'Dashboard | KAADUGAL Admin', loadComponent: () => import('./pages/admin').then((m) => m.AdminDashboard) },
      { path: 'products', title: 'Products | KAADUGAL Admin', loadComponent: () => import('./pages/admin-products').then((m) => m.AdminProducts) },
      { path: 'products/new', title: 'Add product | KAADUGAL Admin', loadComponent: () => import('./pages/admin-products').then((m) => m.AdminProductForm) },
      { path: 'products/:id', title: 'Edit product | KAADUGAL Admin', loadComponent: () => import('./pages/admin-products').then((m) => m.AdminProductForm) },
      { path: 'orders', title: 'Orders | KAADUGAL Admin', loadComponent: () => import('./pages/admin').then((m) => m.AdminOrders) },
      { path: 'customers', title: 'Customers | KAADUGAL Admin', loadComponent: () => import('./pages/admin').then((m) => m.AdminCustomers) },
    ],
  },
  { path: 'info/:page', title: 'KAADUGAL', loadComponent: () => import('./pages/info').then((m) => m.InfoPage) },
  { path: '**', title: 'Page not found | KAADUGAL', loadComponent: () => import('./pages/info').then((m) => m.NotFoundPage) },
];

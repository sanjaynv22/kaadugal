# KAADUGAL

KAADUGAL is a multi-category online marketplace built with Angular and Tailwind CSS. Shoppers can browse ten categories, search, filter, add to cart and wishlist, and check out. A separate admin panel manages products, stock, orders and customers.

*Kaadugal* means "forests" in Tamil. Like a forest, the store has a bit of everything in one place.

> **Demo project.** There is no backend. Products are sample data, and accounts, carts, orders and admin changes are saved in the browser's LocalStorage. Payments are mock, and no goods are shipped.

## Features

### Store
- Home page with an offers carousel, shop by category, today's deals with a countdown, best sellers, trending, recommendations, recently viewed and featured brands
- Ten categories: Electronics, Mobiles & Accessories, Fashion, Home & Kitchen, Beauty & Personal Care, Books, Sports & Fitness, Grocery, Toys & Games and Furniture
- Search with suggestions and a category dropdown
- Product listing with filters for category, price, brand and rating, sorting by popularity, price, newest and rating, and pagination
- Product page with an image gallery, price and discount, stock status, specifications, reviews and related products
- Cart with quantity controls, a price breakdown and free delivery from ₹499
- Wishlist
- Checkout with saved addresses and UPI, card, net banking or cash on delivery (mock payment)
- Customer account with profile, order history, order cancellation, saved addresses and wishlist
- Delivery location selector, plus help, returns, privacy, terms and contact pages
- Responsive layouts for phone, tablet and desktop

### Admin panel
- Separate admin sign-in. Customers and guests can't open admin pages.
- Dashboard with sales, orders, customers, product count, recent orders and low-stock items
- Add, edit and delete products, and change prices, MRP, stock, images, labels and deals
- View all orders and set each one to Confirmed, Shipped, Delivered or Cancelled
- View customers with their order counts and total spent
- Placing an order reduces stock, and cancelling one puts the stock back

## Tech stack

- Angular 22 with standalone components, signals and lazy-loaded routes
- TypeScript
- Tailwind CSS 4
- Angular Router
- LocalStorage for persistence
- Docker with nginx for serving the production build

## Getting started

You need Node.js 22.22 or newer.

```bash
npm install
npm start
```

Open http://localhost:4200.

On Windows PowerShell, if you see `running scripts is disabled`, use `npm.cmd install` and `npm.cmd start` instead.

### Production build

```bash
npm run build
```

The output is in `dist/kaadugal/browser`. When hosting it yourself, send unknown paths to `index.html` so links like `/product/...` work after a refresh.

## Run with Docker

With Docker Desktop running:

```bash
docker compose up -d --build
```

Open http://localhost:8080. To stop it, run `docker compose down`.

## Demo accounts

| Account | How to sign in |
|---|---|
| Customer | Select **Continue with the demo account** on the sign-in page, or create an account |
| Admin | Go to `/admin` and sign in with `admin@kaadugal.example` / `Admin@123` |

## Project structure

```
src/app/
  components/   Header, footer, product card, product rail and shared UI
  pages/        Store, account and admin pages
  services/     Catalogue, cart, wishlist, auth, orders, admin and storage
  data/         Sample products and categories
public/catalog/ Book cover and toy illustrations
Dockerfile, compose.yaml, nginx.conf   Container setup
```

## Limitations

- **One browser only:** all data lives in LocalStorage, so orders and admin changes don't reach other browsers or devices.
- **Not real security:** the admin sign-in check runs in the browser, and the demo password is in the code.
- **Mock payments:** no payment is taken.
- **Online photos:** most product photos load from the DummyJSON CDN and need an internet connection.

Before going live you would need a backend and database, server-side authentication, and a real payment gateway.

## Credits

Most sample product data and photos come from the [DummyJSON](https://dummyjson.com) demo catalogue. Brand names belong to their owners and are used only as sample data. The book covers and toy illustrations were drawn for this project.

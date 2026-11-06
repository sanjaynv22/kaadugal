# KAADUGAL

A multi-category shopping marketplace built with Angular standalone components, signals, Angular Router and Tailwind CSS. There is no backend: the catalogue is sample data, and the cart, wishlist, account, addresses and orders persist in LocalStorage.

## Run it

```
npm install
npm start
```

Then open http://localhost:4200. To sign in quickly, use **Continue with the demo account** on the sign-in page. `npm run build` creates the production build in `dist/kaadugal`. When hosting it, send unknown paths to `index.html` so deep links work.

## Run with Docker

With Docker Desktop running, from this folder:

```
docker compose up -d --build
```

Then open http://localhost:8080. Stop it with `docker compose down`.

## Admin panel

Open http://localhost:4200/admin and sign in with `admin@kaadugal.example` and `Admin@123`. From there you can manage products, stock, prices, orders and customers.

The admin panel shares this browser's LocalStorage with the store. Changes don't reach other browsers or devices, and the sign-in check runs in the browser, so it isn't real security. Add a backend and server-side checks before going live.

## Where things live

- `src/app/pages`: routed pages
- `src/app/components`: header, footer, product card, rail and shared UI
- `src/app/services`: catalogue, cart, wishlist, auth, orders, shopper context
- `src/app/data`: sample products and categories
- `public/catalog`: book cover and toy illustrations

## Sample content

Most product data and photos come from the [DummyJSON](https://dummyjson.com) demo catalogue, with photos loaded from its CDN. They're for demonstration only; replace them, the real brand names and the placeholder policy pages before a real launch. Prices are sample conversions to rupees.

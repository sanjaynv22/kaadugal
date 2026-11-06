import { Category } from '../models';
import { PRODUCTS } from './products.data';

const img = (id: number) => PRODUCTS.find((p) => p.id === id)!.thumb;

export const CATEGORIES: Category[] = [
  { slug: 'electronics', name: 'Electronics', short: 'Electronics', image: img(78), blurb: 'Laptops, tablets, audio and smart devices' },
  { slug: 'mobiles', name: 'Mobiles & Accessories', short: 'Mobiles', image: img(123), blurb: 'Phones, chargers, cases and camera gear' },
  { slug: 'fashion', name: 'Fashion', short: 'Fashion', image: img(172), blurb: 'Clothing, shoes, watches and bags' },
  { slug: 'home-kitchen', name: 'Home & Kitchen', short: 'Home & Kitchen', image: img(66), blurb: 'Cookware, appliances and decor' },
  { slug: 'beauty', name: 'Beauty & Personal Care', short: 'Beauty', image: img(8), blurb: 'Makeup, fragrance and skin care' },
  { slug: 'books', name: 'Books', short: 'Books', image: img(1001), blurb: 'Classics in clean new editions' },
  { slug: 'sports', name: 'Sports & Fitness', short: 'Sports', image: img(143), blurb: 'Cricket, football, tennis and more' },
  { slug: 'grocery', name: 'Grocery', short: 'Grocery', image: img(40), blurb: 'Fresh produce and pantry staples' },
  { slug: 'toys', name: 'Toys & Games', short: 'Toys', image: img(1103), blurb: 'Traditional games and screen-free play' },
  { slug: 'furniture', name: 'Furniture', short: 'Furniture', image: img(12), blurb: 'Sofas, beds, chairs and tables' },
];

export const FEATURED_BRANDS = ['Apple', 'Samsung', 'Nike', 'Puma', 'Dior', 'Lenovo', 'Realme', 'Calvin Klein'];

export const CITIES = [
  { city: 'Chennai', pincode: '600001' }, { city: 'Bengaluru', pincode: '560001' },
  { city: 'Mumbai', pincode: '400001' }, { city: 'Delhi', pincode: '110001' },
  { city: 'Hyderabad', pincode: '500001' }, { city: 'Kolkata', pincode: '700001' },
];

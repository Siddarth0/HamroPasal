// Placeholder data for the homepage until the catalog API is wired in.
// Grayscale imagery matches the reference's monochrome product photography.

export const img = (seed: string | number, size = 400) =>
  `https://picsum.photos/seed/bb-${seed}/${size}/${size}?grayscale`;

export interface MockProduct {
  id: string;
  name: string;
  price: number;
  comparePrice?: number;
  rating?: number;
  sold?: string;
  seed: string;
  soldPercent?: number; // for flash-sale progress bar
}

export const categories = [
  { name: 'T-Shirt', seed: 'tshirt' },
  { name: 'Jacket', seed: 'jacket' },
  { name: 'Shirt', seed: 'shirt' },
  { name: 'Jeans', seed: 'jeans' },
  { name: 'Bag', seed: 'bag' },
  { name: 'Shoes', seed: 'shoes' },
  { name: 'Watches', seed: 'watch' },
  { name: 'Cap', seed: 'cap' },
];

export const flashSale: MockProduct[] = [
  { id: 'f1', name: 'EliteShield Performance Men’s Jacket', price: 2550, comparePrice: 5250, seed: 'jacket1', soldPercent: 90 },
  { id: 'f2', name: 'Gentlemen’s Summer Gray Hat - Premium Blend', price: 990, comparePrice: 1500, seed: 'hat1', soldPercent: 95 },
  { id: 'f3', name: 'OptiZoom Camera Shoulder Bag', price: 2500, comparePrice: 4250, seed: 'bag1', soldPercent: 50 },
  { id: 'f4', name: 'Cloudy Chic - Grey Peep Toe Heeled Sandals', price: 2700, comparePrice: 5800, seed: 'heels1', soldPercent: 50 },
  { id: 'f5', name: 'Classic Leather Belt - Charcoal', price: 1200, comparePrice: 2100, seed: 'belt1', soldPercent: 30 },
];

export const recommended: MockProduct[] = [
  { id: 'r1', name: 'UrbanEdge Men’s Jeans Collection', price: 2530, comparePrice: 3700, rating: 4.9, sold: '10K+', seed: 'jeans1' },
  { id: 'r2', name: 'Essentials Men’s Long-Sleeve Oxford Shirt', price: 1790, rating: 4.9, sold: '10K+', seed: 'oxford1' },
  { id: 'r3', name: 'StyleHaven Men’s Fashionable Brogues', price: 1990, comparePrice: 3250, rating: 4.9, sold: '8K+', seed: 'brogue1' },
  { id: 'r4', name: 'Essential Long-Sleeve Crewneck Shirt for Men', price: 1200, rating: 4.9, sold: '5K+', seed: 'crew1' },
  { id: 'r5', name: 'ClassicGent Men’s Formal Shoes', price: 1990, rating: 4.9, sold: '4K+', seed: 'formal1' },
  { id: 'r6', name: 'UrbanFlex Men’s Short Pants Collection', price: 1620, rating: 4.9, sold: '2K+', seed: 'shorts1' },
  { id: 'r7', name: 'ChicCarry - Elegant Women’s Tote Collection', price: 6500, rating: 4.9, sold: '500+', seed: 'tote1' },
  { id: 'r8', name: 'Sophisticated Women’s Parka Line', price: 3240, comparePrice: 5500, rating: 4.9, sold: '100+', seed: 'parka1' },
];

export const tabs = ['Best Seller', 'New Arrivals', 'Special Discount', 'Official Stores', 'Trending'];

// Multi-vendor: independent seller stores (Nepal-flavored).
export const stores = [
  { name: 'Everest Threads', tagline: '“Wear the summit”', seed: 'store1', items: [{ price: 6500, seed: 's1a' }, { price: 2700, seed: 's1b' }, { price: 990, seed: 's1c' }] },
  { name: 'Kathmandu Kicks', tagline: '“Step up your game”', seed: 'store2', items: [{ price: 3240, seed: 's2a' }, { price: 1990, seed: 's2b' }, { price: 1200, seed: 's2c' }] },
  { name: 'Himalaya Home', tagline: '“Comfort, crafted”', seed: 'store3', items: [{ price: 1790, seed: 's3a' }, { price: 1990, seed: 's3b' }, { price: 2530, seed: 's3c' }] },
  { name: 'Newa Bazaar', tagline: '“Heritage meets style”', seed: 'store4', items: [{ price: 2500, seed: 's4a' }, { price: 1620, seed: 's4b' }, { price: 2550, seed: 's4c' }] },
];

import type {
  Customer,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Product,
  ProductCategory,
  Profile,
  User,
} from '@/api/types';
import { SeededRandom } from './random';

const FIRST_NAMES = [
  'Rahim', 'Karim', 'Fatema', 'Ayesha', 'Tanvir', 'Nusrat', 'Sabbir', 'Mitu', 'Imran', 'Shila',
  'Farhan', 'Jannat', 'Rafiq', 'Sumaiya', 'Arif', 'Lamia', 'Hasan', 'Tasnim', 'Mahmud', 'Rupa',
  'Shakil', 'Nazia', 'Fahim', 'Priya', 'Rakib', 'Sadia', 'Jamal', 'Mim', 'Tanjil', 'Sharmin',
];
const LAST_NAMES = ['Ahmed', 'Hossain', 'Islam', 'Khan', 'Rahman', 'Chowdhury', 'Akter', 'Begum', 'Uddin', 'Sarker', 'Das', 'Roy', 'Haque', 'Mia', 'Sultana'];

const CITIES: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['Dhaka', ['Dhanmondi', 'Mirpur', 'Uttara', 'Gulshan', 'Banani', 'Mohammadpur', 'Badda', 'Motijheel', 'Bashundhara']],
  ['Chattogram', ['Agrabad', 'Nasirabad', 'Halishahar', 'Pahartali']],
  ['Sylhet', ['Zindabazar', 'Ambarkhana', 'Subid Bazar']],
  ['Rajshahi', ['Shaheb Bazar', 'Uposhohor']],
  ['Khulna', ['Sonadanga', 'Boyra']],
  ['Bogura', ['Satmatha', 'Jaleshwaritola']],
];

interface ProductSeed {
  name: string;
  nameBn: string;
  category: ProductCategory;
  /** Price in taka. */
  price: number;
}

const PRODUCT_SEEDS: readonly ProductSeed[] = [
  { name: 'Miniket Rice 25 kg', nameBn: 'মিনিকেট চাল ২৫ কেজি', category: 'grocery', price: 1850 },
  { name: 'Mustard Oil 1 L', nameBn: 'সরিষার তেল ১ লিটার', category: 'grocery', price: 320 },
  { name: 'Soybean Oil 5 L', nameBn: 'সয়াবিন তেল ৫ লিটার', category: 'grocery', price: 890 },
  { name: 'Red Lentils (Masoor) 1 kg', nameBn: 'মসুর ডাল ১ কেজি', category: 'grocery', price: 140 },
  { name: 'Hilsa Fish 1 kg', nameBn: 'ইলিশ মাছ ১ কেজি', category: 'grocery', price: 1600 },
  { name: 'Sundarban Honey 500 g', nameBn: 'সুন্দরবনের মধু ৫০০ গ্রাম', category: 'grocery', price: 650 },
  { name: 'Sylhet Tea Leaves 400 g', nameBn: 'সিলেটি চা পাতা ৪০০ গ্রাম', category: 'grocery', price: 240 },
  { name: 'Jamdani Saree', nameBn: 'জামদানি শাড়ি', category: 'fashion', price: 6500 },
  { name: 'Cotton Panjabi', nameBn: 'সুতির পাঞ্জাবি', category: 'fashion', price: 1450 },
  { name: 'Three-piece Salwar Kameez', nameBn: 'থ্রি-পিস সালোয়ার কামিজ', category: 'fashion', price: 2200 },
  { name: 'Leather Sandals', nameBn: 'চামড়ার স্যান্ডেল', category: 'fashion', price: 1200 },
  { name: 'Kids Eid Dress', nameBn: 'বাচ্চাদের ঈদের জামা', category: 'fashion', price: 980 },
  { name: 'Smart LED TV 43"', nameBn: 'স্মার্ট এলইডি টিভি ৪৩"', category: 'electronics', price: 32500 },
  { name: 'Ceiling Fan 56"', nameBn: 'সিলিং ফ্যান ৫৬"', category: 'electronics', price: 3400 },
  { name: 'Rice Cooker 1.8 L', nameBn: 'রাইস কুকার ১.৮ লিটার', category: 'electronics', price: 2650 },
  { name: 'Power Bank 20000 mAh', nameBn: 'পাওয়ার ব্যাংক ২০০০০ এমএএইচ', category: 'electronics', price: 1890 },
  { name: 'Bluetooth Earbuds', nameBn: 'ব্লুটুথ ইয়ারবাড', category: 'electronics', price: 1350 },
  { name: 'Rechargeable Table Fan', nameBn: 'রিচার্জেবল টেবিল ফ্যান', category: 'electronics', price: 2100 },
  { name: 'Nakshi Kantha Bedsheet', nameBn: 'নকশি কাঁথা বেডশিট', category: 'home', price: 2800 },
  { name: 'Non-stick Karai 26 cm', nameBn: 'নন-স্টিক কড়াই ২৬ সেমি', category: 'home', price: 1150 },
  { name: 'Mosquito Net (Double)', nameBn: 'মশারি (ডাবল)', category: 'home', price: 720 },
  { name: 'Stainless Steel Tiffin Box', nameBn: 'স্টিলের টিফিন বক্স', category: 'home', price: 450 },
  { name: 'Shital Pati Floor Mat', nameBn: 'শীতল পাটি', category: 'home', price: 1300 },
  { name: 'Neem Face Wash 100 ml', nameBn: 'নিম ফেসওয়াশ ১০০ মিলি', category: 'beauty', price: 180 },
  { name: 'Coconut Hair Oil 200 ml', nameBn: 'নারকেল তেল ২০০ মিলি', category: 'beauty', price: 160 },
  { name: 'Attar (Oud) 6 ml', nameBn: 'আতর (উদ) ৬ মিলি', category: 'beauty', price: 550 },
  { name: 'Herbal Soap Pack of 4', nameBn: 'হারবাল সাবান ৪টি', category: 'beauty', price: 260 },
  { name: 'Mehendi Cone Set', nameBn: 'মেহেদি কোন সেট', category: 'beauty', price: 120 },
];

const STATUS_WEIGHTS: ReadonlyArray<readonly [OrderStatus, number]> = [
  ['delivered', 45],
  ['shipped', 15],
  ['processing', 15],
  ['pending', 12],
  ['cancelled', 9],
  ['refunded', 4],
];

const PAYMENT_WEIGHTS: ReadonlyArray<readonly [PaymentMethod, number]> = [
  ['bkash', 40],
  ['cod', 35],
  ['nagad', 15],
  ['card', 10],
];

export interface MockDatabase {
  users: User[];
  customers: Customer[];
  products: Product[];
  orders: Order[];
  profile: Profile;
}

const DAY = 24 * 60 * 60 * 1000;

function pad(n: number, width: number): string {
  return n.toString().padStart(width, '0');
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

/**
 * Build the whole dataset from a seed. `now` is injectable so tests can pin
 * the clock; the app passes the real current time so the revenue chart always
 * ends "today".
 */
export function createDatabase(seed = 20260101, now: Date = new Date()): MockDatabase {
  const rng = new SeededRandom(seed);
  const today = new Date(now);
  today.setHours(12, 0, 0, 0);

  const users: User[] = [
    { id: 'u_1', name: 'Akib Jafor', email: 'admin@shopbd.test', role: 'admin', phone: '+8801712000001' },
    { id: 'u_2', name: 'Nusrat Jahan', email: 'manager@shopbd.test', role: 'manager', phone: '+8801812000002' },
    { id: 'u_3', name: 'Sabbir Hossain', email: 'support@shopbd.test', role: 'support', phone: '+8801912000003' },
  ];

  const products: Product[] = PRODUCT_SEEDS.map((p, index) => {
    const created = new Date(today.getTime() - rng.int(120, 400) * DAY);
    return {
      id: `p_${index + 1}`,
      sku: `${p.category.slice(0, 3).toUpperCase()}-${pad(index + 1, 4)}`,
      name: p.name,
      nameBn: p.nameBn,
      category: p.category,
      price: p.price * 100,
      stock: rng.chance(0.12) ? rng.int(0, 4) : rng.int(8, 240),
      active: rng.chance(0.93),
      createdAt: created.toISOString(),
      updatedAt: new Date(created.getTime() + rng.int(1, 90) * DAY).toISOString(),
    };
  });

  const customers: Customer[] = Array.from({ length: 120 }, (_, index) => {
    const first = rng.pick(FIRST_NAMES);
    const last = rng.pick(LAST_NAMES);
    const [city, areas] = rng.pick(CITIES);
    const prefix = rng.pick(['013', '014', '015', '016', '017', '018', '019']);
    return {
      id: `c_${index + 1}`,
      name: `${first} ${last}`,
      email: `${slug(first)}.${slug(last)}${index + 1}@example.com`,
      phone: `+880${prefix.slice(1)}${pad(rng.int(0, 99_999_999), 8)}`,
      city,
      area: rng.pick(areas),
      ordersCount: 0,
      totalSpent: 0,
      createdAt: new Date(today.getTime() - rng.int(10, 540) * DAY).toISOString(),
    };
  });

  const orders: Order[] = Array.from({ length: 480 }, (_, index) => {
    const customer = rng.pick(customers);
    // Skew towards recent days so the 30-day chart has plenty of points.
    const daysAgo = rng.chance(0.6) ? rng.int(0, 29) : rng.int(30, 180);
    const created = new Date(today.getTime() - daysAgo * DAY - rng.int(0, 11) * 60 * 60 * 1000);
    const itemCount = rng.weighted([[1, 50], [2, 30], [3, 15], [4, 5]] as const);
    const chosen = new Set<Product>();
    while (chosen.size < itemCount) chosen.add(rng.pick(products));
    const items: OrderItem[] = [...chosen].map((p) => ({
      productId: p.id,
      name: p.name,
      quantity: rng.int(1, 3),
      unitPrice: p.price,
    }));
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const shipping = customer.city === 'Dhaka' ? 6000 : 12000;
    const status = daysAgo < 2 ? rng.weighted([['pending', 50], ['processing', 50]] as const) : rng.weighted(STATUS_WEIGHTS);
    const order: Order = {
      id: `o_${index + 1}`,
      number: `SBD-${created.getFullYear()}${pad(created.getMonth() + 1, 2)}-${pad(10_000 + index, 5)}`,
      customerId: customer.id,
      customerName: customer.name,
      status,
      paymentMethod: rng.weighted(PAYMENT_WEIGHTS),
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      city: customer.city,
      createdAt: created.toISOString(),
      updatedAt: new Date(created.getTime() + rng.int(1, 72) * 60 * 60 * 1000).toISOString(),
    };
    if (status !== 'cancelled' && status !== 'refunded') {
      customer.ordersCount += 1;
      customer.totalSpent += order.total;
    }
    return order;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const profile: Profile = {
    name: users[0]?.name ?? 'Admin',
    email: users[0]?.email ?? 'admin@shopbd.test',
    phone: users[0]?.phone ?? '',
    storeName: 'ShopBD',
    notifications: { newOrder: true, lowStock: true, weeklyReport: false },
  };

  return { users, customers, products, orders, profile };
}

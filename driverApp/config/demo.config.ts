/**
 * Demo Mode Configuration
 * Use this to preview the app without Supabase backend
 */

export const DEMO_MODE = true; // Set to false when you have Supabase credentials

export const DEMO_DRIVER = {
  id: 'demo-driver-1',
  name: 'John Driver',
  phone: '+998901234567',
  email: 'driver@watergo.uz',
  is_active: true,
  created_at: new Date('2025-01-01').toISOString(),
};

export const DEMO_ORDERS = [
  {
    id: '1',
    order_number: 'ORD-001',
    stage: 'IN_QUEUE',
    total: 45.00,
    delivery_fee: 5.00,
    created_at: new Date().toISOString(),
    delivered_at: null,
    users: {
      name: 'Ali Karimov',
      phone: '+998901234567',
    },
    addresses: {
      id: '1',
      title: 'Home',
      address: 'Mustaqillik Ave 98, Tashkent',
      latitude: 41.311081,
      longitude: 69.240562,
    },
    firms: {
      name: 'Aqua Fresh',
      phone: '+998712001234',
    },
    order_items: [
      { id: '1', quantity: 3, price: 10.00, product_name: 'Spring Water 19L' },
      { id: '2', quantity: 2, price: 7.50, product_name: 'Mineral Water 5L' },
    ],
  },
  {
    id: '2',
    order_number: 'ORD-002',
    stage: 'COURIER_ON_THE_WAY',
    total: 30.00,
    delivery_fee: 5.00,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    delivered_at: null,
    users: {
      name: 'Dilshod Umarov',
      phone: '+998909876543',
    },
    addresses: {
      id: '2',
      title: 'Office',
      address: 'Amir Temur Ave 50, Tashkent',
      latitude: 41.311151,
      longitude: 69.279737,
    },
    firms: {
      name: 'Crystal Water',
      phone: '+998712005678',
    },
    order_items: [
      { id: '3', quantity: 2, price: 10.00, product_name: 'Spring Water 19L' },
      { id: '4', quantity: 1, price: 10.00, product_name: 'Distilled Water 10L' },
    ],
  },
];

export const DEMO_HISTORY = [
  {
    id: '3',
    order_number: 'ORD-003',
    stage: 'DELIVERED',
    total: 50.00,
    delivery_fee: 5.00,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    delivered_at: new Date(Date.now() - 82800000).toISOString(),
    users: {
      name: 'Nodira Rahimova',
      phone: '+998901112233',
    },
    addresses: {
      id: '3',
      title: 'Apartment',
      address: 'Yunusabad 12, Tashkent',
      latitude: 41.363297,
      longitude: 69.289169,
    },
    firms: {
      name: 'Pure Water Co',
      phone: '+998712009999',
    },
    order_items: [
      { id: '5', quantity: 5, price: 10.00, product_name: 'Spring Water 19L' },
    ],
  },
  {
    id: '4',
    order_number: 'ORD-004',
    stage: 'DELIVERED',
    total: 40.00,
    delivery_fee: 5.00,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    delivered_at: new Date(Date.now() - 169200000).toISOString(),
    users: {
      name: 'Javohir Saidov',
      phone: '+998905556677',
    },
    addresses: {
      id: '4',
      title: 'Home',
      address: 'Sergeli 5, Tashkent',
      latitude: 41.207451,
      longitude: 69.223278,
    },
    firms: {
      name: 'Aqua Fresh',
      phone: '+998712001234',
    },
    order_items: [
      { id: '6', quantity: 4, price: 10.00, product_name: 'Spring Water 19L' },
    ],
  },
];

export const DEMO_EARNINGS = {
  todayEarnings: 10.00,
  todayDeliveries: 2,
  weekEarnings: 35.00,
  weekDeliveries: 7,
  monthEarnings: 150.00,
  monthDeliveries: 30,
  totalEarnings: 500.00,
  totalDeliveries: 100,
};

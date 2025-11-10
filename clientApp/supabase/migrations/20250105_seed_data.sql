-- Seed Data for Nukus Water Delivery Firms
-- Realistic water delivery companies in Nukus, Uzbekistan

-- ============================================
-- FIRMS (Water Companies in Nukus)
-- ============================================

INSERT INTO public.firms (id, name, logo, rating, delivery_time, min_order, delivery_fee, is_active) VALUES
  -- Major water delivery firms in Nukus
  ('550e8400-e29b-41d4-a716-446655440001', 'AquaPure Nukus', 'https://placehold.co/200x200/2D6FFF/white?text=AquaPure', 4.8, '25-35 min', 15000, 5000, TRUE),
  ('550e8400-e29b-41d4-a716-446655440002', 'Crystal Water', 'https://placehold.co/200x200/00A3E0/white?text=Crystal', 4.7, '30-40 min', 20000, 4000, TRUE),
  ('550e8400-e29b-41d4-a716-446655440003', 'Nukus Suv Tashuvchisi', 'https://placehold.co/200x200/28A745/white?text=Nukus', 4.9, '20-30 min', 15000, 5000, TRUE),
  ('550e8400-e29b-41d4-a716-446655440004', 'Toza Suv', 'https://placehold.co/200x200/17A2B8/white?text=Toza', 4.6, '35-45 min', 25000, 3000, TRUE),
  ('550e8400-e29b-41d4-a716-446655440005', 'Fresh Water Delivery', 'https://placehold.co/200x200/FFC107/white?text=Fresh', 4.8, '25-35 min', 20000, 4500, TRUE),
  ('550e8400-e29b-41d4-a716-446655440006', 'BestWater Nukus', 'https://placehold.co/200x200/6F42C1/white?text=Best', 4.5, '30-40 min', 15000, 5000, TRUE),
  ('550e8400-e29b-41d4-a716-446655440007', 'Premium Aqua', 'https://placehold.co/200x200/DC3545/white?text=Premium', 4.9, '20-30 min', 30000, 6000, TRUE),
  ('550e8400-e29b-41d4-a716-446655440008', 'EcoWater Karakalpakstan', 'https://placehold.co/200x200/20C997/white?text=Eco', 4.7, '25-35 min', 20000, 4000, TRUE),
  ('550e8400-e29b-41d4-a716-446655440009', 'Arqon Suv', 'https://placehold.co/200x200/6610F2/white?text=Arqon', 4.6, '30-45 min', 15000, 3500, TRUE),
  ('550e8400-e29b-41d4-a716-446655440010', 'Nukus Water Express', 'https://placehold.co/200x200/FD7E14/white?text=Express', 4.8, '15-25 min', 25000, 7000, TRUE),
  ('550e8400-e29b-41d4-a716-446655440011', 'Mountain Spring Nukus', 'https://placehold.co/200x200/0DCAF0/white?text=Mountain', 4.7, '30-40 min', 20000, 4500, TRUE),
  ('550e8400-e29b-41d4-a716-446655440012', 'Qoraalpaq Suv', 'https://placehold.co/200x200/198754/white?text=Qoraalp', 4.5, '35-45 min', 15000, 3000, TRUE);

-- ============================================
-- PRODUCTS (Water Bottles)
-- ============================================

-- Products for AquaPure Nukus
INSERT INTO public.products (id, firm_id, name, description, price, image, volume, in_stock) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '19L Toza Suv', 'Tog'' manbalari suvidan olingan toza suv', 12000, 'https://placehold.co/300x300/2D6FFF/white?text=19L', '19L', TRUE),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '19L Premium', 'Minerallar bilan boyitilgan', 15000, 'https://placehold.co/300x300/2D6FFF/white?text=19L+Premium', '19L', TRUE),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '5L Oilaviy', 'Kichik hajmdagi idish', 5000, 'https://placehold.co/300x300/2D6FFF/white?text=5L', '5L', TRUE);

-- Products for Crystal Water
INSERT INTO public.products (firm_id, name, description, price, image, volume, in_stock) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', '19L Crystal', 'Kristal toza suv', 13000, 'https://placehold.co/300x300/00A3E0/white?text=19L', '19L', TRUE),
  ('550e8400-e29b-41d4-a716-446655440002', '19L Crystal Plus', 'Qo''shimcha filtrlangan', 16000, 'https://placehold.co/300x300/00A3E0/white?text=19L+Plus', '19L', TRUE),
  ('550e8400-e29b-41d4-a716-446655440002', '10L Crystal', 'O''rta hajm', 8000, 'https://placehold.co/300x300/00A3E0/white?text=10L', '10L', TRUE);

-- Products for Nukus Suv Tashuvchisi
INSERT INTO public.products (firm_id, name, description, price, image, volume, in_stock) VALUES
  ('550e8400-e29b-41d4-a716-446655440003', '19L Standart', 'Kundalik foydalanish uchun', 11000, 'https://placehold.co/300x300/28A745/white?text=19L', '19L', TRUE),
  ('550e8400-e29b-41d4-a716-446655440003', '19L Premium', 'Yuqori sifatli suv', 14000, 'https://placehold.co/300x300/28A745/white?text=19L+Premium', '19L', TRUE);

-- Products for Toza Suv
INSERT INTO public.products (firm_id, name, description, price, image, volume, in_stock) VALUES
  ('550e8400-e29b-41d4-a716-446655440004', '19L Toza', 'Eng toza suv', 13500, 'https://placehold.co/300x300/17A2B8/white?text=19L', '19L', TRUE),
  ('550e8400-e29b-41d4-a716-446655440004', '19L Mineral', 'Tabiiy minerallar', 17000, 'https://placehold.co/300x300/17A2B8/white?text=19L+Mineral', '19L', TRUE),
  ('550e8400-e29b-41d4-a716-446655440004', '6L Kichik', 'Sayohat uchun', 6000, 'https://placehold.co/300x300/17A2B8/white?text=6L', '6L', TRUE);

-- Products for Fresh Water Delivery
INSERT INTO public.products (firm_id, name, description, price, image, volume, in_stock) VALUES
  ('550e8400-e29b-41d4-a716-446655440005', '19L Fresh', 'Yangi filtrlangan', 12500, 'https://placehold.co/300x300/FFC107/white?text=19L', '19L', TRUE),
  ('550e8400-e29b-41d4-a716-446655440005', '19L Fresh Premium', 'Eng yaxshi sifat', 15500, 'https://placehold.co/300x300/FFC107/white?text=19L+Premium', '19L', TRUE);

-- Products for BestWater Nukus
INSERT INTO public.products (firm_id, name, description, price, image, volume, in_stock) VALUES
  ('550e8400-e29b-41d4-a716-446655440006', '19L Best', 'Eng yaxshi tanlov', 12000, 'https://placehold.co/300x300/6F42C1/white?text=19L', '19L', TRUE),
  ('550e8400-e29b-41d4-a716-446655440006', '19L Best Gold', 'Oltin sifat', 16500, 'https://placehold.co/300x300/6F42C1/white?text=19L+Gold', '19L', TRUE),
  ('550e8400-e29b-41d4-a716-446655440006', '8L Best Mini', 'Qulay hajm', 7000, 'https://placehold.co/300x300/6F42C1/white?text=8L', '8L', TRUE);

-- Products for Premium Aqua
INSERT INTO public.products (firm_id, name, description, price, image, volume, in_stock) VALUES
  ('550e8400-e29b-41d4-a716-446655440007', '19L Premium', 'Premium sifat', 18000, 'https://placehold.co/300x300/DC3545/white?text=19L', '19L', TRUE),
  ('550e8400-e29b-41d4-a716-446655440007', '19L Premium Diamond', 'Olmos sifat', 22000, 'https://placehold.co/300x300/DC3545/white?text=19L+Diamond', '19L', TRUE);

-- Products for EcoWater Karakalpakstan
INSERT INTO public.products (firm_id, name, description, price, image, volume, in_stock) VALUES
  ('550e8400-e29b-41d4-a716-446655440008', '19L Eco', 'Ekologik toza', 13000, 'https://placehold.co/300x300/20C997/white?text=19L', '19L', TRUE),
  ('550e8400-e29b-41d4-a716-446655440008', '19L Eco Plus', 'Qo''shimcha toza', 16000, 'https://placehold.co/300x300/20C997/white?text=19L+Plus', '19L', TRUE);

-- Products for Arqon Suv
INSERT INTO public.products (firm_id, name, description, price, image, volume, in_stock) VALUES
  ('550e8400-e29b-41d4-a716-446655440009', '19L Arqon', 'Ishonchli suv', 11500, 'https://placehold.co/300x300/6610F2/white?text=19L', '19L', TRUE),
  ('550e8400-e29b-41d4-a716-446655440009', '19L Arqon Premium', 'Premium arqon', 14500, 'https://placehold.co/300x300/6610F2/white?text=19L+Premium', '19L', TRUE);

-- Products for Nukus Water Express
INSERT INTO public.products (firm_id, name, description, price, image, volume, in_stock) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', '19L Express', 'Tez yetkaziladi', 14000, 'https://placehold.co/300x300/FD7E14/white?text=19L', '19L', TRUE),
  ('550e8400-e29b-41d4-a716-446655440010', '19L Express VIP', 'VIP xizmat', 19000, 'https://placehold.co/300x300/FD7E14/white?text=19L+VIP', '19L', TRUE);

-- Products for Mountain Spring Nukus
INSERT INTO public.products (firm_id, name, description, price, image, volume, in_stock) VALUES
  ('550e8400-e29b-41d4-a716-446655440011', '19L Mountain', 'Tog'' suvi', 13500, 'https://placehold.co/300x300/0DCAF0/white?text=19L', '19L', TRUE),
  ('550e8400-e29b-41d4-a716-446655440011', '19L Mountain Premium', 'Premium tog'' suvi', 17000, 'https://placehold.co/300x300/0DCAF0/white?text=19L+Premium', '19L', TRUE);

-- Products for Qoraalpaq Suv
INSERT INTO public.products (firm_id, name, description, price, image, volume, in_stock) VALUES
  ('550e8400-e29b-41d4-a716-446655440012', '19L Qoraalpa', 'Mahalliy suv', 11000, 'https://placehold.co/300x300/198754/white?text=19L', '19L', TRUE),
  ('550e8400-e29b-41d4-a716-446655440012', '19L Qoraalpa Plus', 'Yaxshilangan formula', 14000, 'https://placehold.co/300x300/198754/white?text=19L+Plus', '19L', TRUE);

-- ============================================
-- SAMPLE DRIVERS (for testing order tracking)
-- ============================================
INSERT INTO public.drivers (id, name, phone, photo, rating, vehicle_number, is_active) VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'Abbos Karimov', '+998901234567', 'https://i.pravatar.cc/150?img=12', 4.9, '01 A 123 BC', TRUE),
  ('750e8400-e29b-41d4-a716-446655440002', 'Sardor Aliyev', '+998901234568', 'https://i.pravatar.cc/150?img=13', 4.8, '01 B 456 DE', TRUE),
  ('750e8400-e29b-41d4-a716-446655440003', 'Rustam Nazarov', '+998901234569', 'https://i.pravatar.cc/150?img=14', 4.7, '01 C 789 FG', TRUE),
  ('750e8400-e29b-41d4-a716-446655440004', 'Jamshid Yusupov', '+998901234570', 'https://i.pravatar.cc/150?img=15', 4.9, '01 D 012 HI', TRUE),
  ('750e8400-e29b-41d4-a716-446655440005', 'Otabek Sharipov', '+998901234571', 'https://i.pravatar.cc/150?img=16', 4.6, '01 E 345 JK', TRUE);

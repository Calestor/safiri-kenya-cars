-- ============================================================
-- Safiri Kenya – Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'renter' CHECK (role IN ('renter', 'owner', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. CARS
CREATE TABLE IF NOT EXISTS public.cars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SUV', 'Sedan', 'Hatchback', 'Minivan')),
  image TEXT,
  images TEXT[] DEFAULT '{}',
  price INTEGER NOT NULL,
  location TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 5,
  transmission TEXT NOT NULL CHECK (transmission IN ('Automatic', 'Manual')),
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('Petrol', 'Diesel', 'Hybrid')),
  mileage INTEGER DEFAULT 0,
  fuel_efficiency TEXT,
  features TEXT[] DEFAULT '{}',
  description TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  rating NUMERIC(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  owner_name TEXT,
  owner_rating NUMERIC(3,2) DEFAULT 5.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
  renter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_price INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. REVIEWS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID REFERENCES public.cars(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Public profiles are viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Cars
CREATE POLICY "Anyone can view available cars" ON public.cars FOR SELECT USING (true);
CREATE POLICY "Owners can insert cars" ON public.cars FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update own cars" ON public.cars FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete own cars" ON public.cars FOR DELETE USING (auth.uid() = owner_id);

-- Bookings
CREATE POLICY "Renters see own bookings" ON public.bookings FOR SELECT USING (auth.uid() = renter_id);
CREATE POLICY "Car owners see bookings for their cars" ON public.bookings FOR SELECT USING (
  auth.uid() IN (SELECT owner_id FROM public.cars WHERE id = car_id)
);
CREATE POLICY "Authenticated users can book" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "Renters can cancel own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = renter_id);

-- Reviews
CREATE POLICY "Anyone can read reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can write reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ============================================================
-- SEED: Initial 11 cars (linked to a placeholder owner)
-- Note: After you sign up, you can update owner_id to your real user ID
-- ============================================================

-- Insert a seed profile first (will be replaced by real users)
INSERT INTO public.profiles (id, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'Safiri Admin', 'admin')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.cars (owner_id, title, brand, model, year, type, image, images, price, location, seats, transmission, fuel_type, mileage, fuel_efficiency, features, description, rating, review_count, owner_name, owner_rating) VALUES
('00000000-0000-0000-0000-000000000001', 'Toyota Prado', 'Toyota', 'Prado TX', 2022, 'SUV', 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=500&h=400&fit=crop', ARRAY['https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&h=600&fit=crop&crop=left','https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&h=600&fit=crop&crop=right'], 5500, 'Nairobi', 7, 'Automatic', 'Diesel', 35000, '8.5 km/l', ARRAY['Air Conditioning','Power Windows','Parking Sensors','Cruise Control','AUX/USB Port','Spacious Trunk','Off-road Capable'], 'Perfect for family safaris and long-distance trips. This Toyota Prado is well-maintained, comfortable, and ideal for exploring Kenya''s diverse landscapes.', 4.8, 42, 'John Kariuki', 4.9),
('00000000-0000-0000-0000-000000000001', 'Suzuki Jimny', 'Suzuki', 'Jimny SZ5', 2021, 'SUV', 'https://images.unsplash.com/photo-1534093607318-f025413f49cb?w=500&h=400&fit=crop', ARRAY['https://images.unsplash.com/photo-1534093607318-f025413f49cb?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1534093607318-f025413f49cb?w=800&h=600&fit=crop&crop=left','https://images.unsplash.com/photo-1534093607318-f025413f49cb?w=800&h=600&fit=crop&crop=right'], 3200, 'Mombasa', 5, 'Manual', 'Petrol', 42000, '12 km/l', ARRAY['Air Conditioning','Power Steering','4WD System','Radio/Cassette','Good Ground Clearance','Compact Design'], 'Compact and reliable SUV perfect for coastal exploration and city driving.', 4.6, 28, 'Aisha Mohammed', 4.7),
('00000000-0000-0000-0000-000000000001', 'Toyota Corolla', 'Toyota', 'Corolla CVT', 2023, 'Sedan', 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&h=400&fit=crop', ARRAY['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&h=600&fit=crop'], 2800, 'Kisumu', 5, 'Automatic', 'Petrol', 28000, '14.5 km/l', ARRAY['Air Conditioning','Power Windows & Locks','ABS Brakes','Airbags','Touchscreen Radio','Keyless Entry','Central Locking'], 'New Toyota Corolla with latest features. Excellent for business trips and city driving.', 4.7, 35, 'David Kipchoge', 4.8),
('00000000-0000-0000-0000-000000000001', 'Nissan X-Trail', 'Nissan', 'X-Trail T31', 2020, 'SUV', 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=400&fit=crop', ARRAY['https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop'], 4200, 'Nakuru', 5, 'Automatic', 'Petrol', 58000, '10 km/l', ARRAY['Air Conditioning','Panoramic Sunroof','Rearview Camera','Cruise Control','Power Steering','All-Terrain Tires'], 'Spacious family SUV with great comfort. Perfect for group trips and comfortable highway driving.', 4.5, 19, 'Patricia Nyambura', 4.6),
('00000000-0000-0000-0000-000000000001', 'Honda Civic', 'Honda', 'Civic EX', 2022, 'Sedan', 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=500&h=400&fit=crop', ARRAY['https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop'], 3500, 'Eldoret', 5, 'Automatic', 'Petrol', 22000, '13.5 km/l', ARRAY['Air Conditioning','Power Windows & Locks','ABS Brakes','Climate Control','Bluetooth Connectivity','Lane Assist','Smart Key'], 'Sleek and modern Honda Civic with excellent safety features.', 4.9, 51, 'Samuel Kiplagat', 4.9),
('00000000-0000-0000-0000-000000000001', 'Mercedes-Benz C-Class', 'Mercedes-Benz', 'C 200 AMG Line', 2023, 'Sedan', 'https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=500&h=400&fit=crop', ARRAY['https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=800&h=600&fit=crop&crop=left','https://images.unsplash.com/photo-1616788494707-ec28f08d05a1?w=800&h=600&fit=crop&crop=right'], 12000, 'Nairobi', 5, 'Automatic', 'Petrol', 18000, '11 km/l', ARRAY['Leather Seats','Panoramic Sunroof','Adaptive Cruise Control','Ambient Lighting','Wireless CarPlay','MBUX Infotainment','Lane Keep Assist','Heated Seats'], 'Experience ultimate luxury in this stunning Mercedes-Benz C 200.', 4.9, 38, 'Grace Mwangi', 5.0),
('00000000-0000-0000-0000-000000000001', 'Tesla Model 3', 'Tesla', 'Model 3 Long Range', 2023, 'Sedan', 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=500&h=400&fit=crop', ARRAY['https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=800&h=600&fit=crop&crop=left','https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?w=800&h=600&fit=crop&crop=right'], 15000, 'Nairobi', 5, 'Automatic', 'Hybrid', 12000, '0 km/l (Electric)', ARRAY['Full Electric Drive','Autopilot','15" Touchscreen','Over-the-Air Updates','Supercharger Access','Premium Audio','Glass Roof','Sentry Mode'], 'Drive the future with this cutting-edge Tesla Model 3.', 4.8, 24, 'Brian Otieno', 4.9),
('00000000-0000-0000-0000-000000000001', 'Nissan Juke', 'Nissan', 'Juke Tekna', 2022, 'Hatchback', 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=500&h=400&fit=crop', ARRAY['https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop&crop=left','https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop&crop=right'], 4500, 'Mombasa', 5, 'Automatic', 'Petrol', 31000, '13 km/l', ARRAY['Air Conditioning','Apple CarPlay','Android Auto','Reversing Camera','Keyless Start','Alloy Wheels','Sport Mode'], 'Funky, stylish, and fun to drive — the Nissan Juke is perfect for coastal road trips.', 4.5, 17, 'Fatuma Hassan', 4.6),
('00000000-0000-0000-0000-000000000001', 'Audi A4', 'Audi', 'A4 S Line', 2022, 'Sedan', 'https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=500&h=400&fit=crop', ARRAY['https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop&crop=left','https://images.unsplash.com/photo-1542282088-fe8426682b8f?w=800&h=600&fit=crop&crop=right'], 10000, 'Nairobi', 5, 'Automatic', 'Petrol', 24000, '12 km/l', ARRAY['Quattro AWD','Virtual Cockpit','Bang & Olufsen Sound','Heated Seats','Adaptive Headlights','MMI Navigation','S Line Body Kit','Parking Assist'], 'Refined German engineering meets Kenyan roads.', 4.7, 31, 'Kevin Ndungu', 4.8),
('00000000-0000-0000-0000-000000000001', 'Bugatti Chiron', 'Bugatti', 'Chiron Sport', 2022, 'Sedan', 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=500&h=400&fit=crop', ARRAY['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop&crop=left','https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop&crop=right'], 150000, 'Nairobi', 2, 'Automatic', 'Petrol', 4000, '3.5 km/l', ARRAY['1500HP W16 Engine','Top Speed 420 km/h','Carbon Fibre Body','Active Aerodynamics','Titanium Exhaust','Custom Interior','Track Mode','GPS Tracking'], 'The pinnacle of automotive engineering. An exclusive opportunity to experience a Bugatti Chiron in Kenya.', 5.0, 7, 'Alex Waweru', 5.0),
('00000000-0000-0000-0000-000000000001', 'Jaguar F-Type', 'Jaguar', 'F-Type R Coupe', 2023, 'Sedan', 'https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=500&h=400&fit=crop', ARRAY['https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&h=600&fit=crop','https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&h=600&fit=crop&crop=left','https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=800&h=600&fit=crop&crop=right'], 18000, 'Nairobi', 2, 'Automatic', 'Petrol', 9000, '9 km/l', ARRAY['Supercharged V8 Engine','Active Sport Exhaust','Configurable Dynamics','InControl Touch Pro','Meridian Sound System','Full Leather Interior','Launch Control','Head-Up Display'], 'Raw British performance and unmistakable style.', 4.9, 14, 'Diana Kamau', 5.0);

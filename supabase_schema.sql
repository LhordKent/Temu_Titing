-- 1. ENUMS (Custom types for our roles and status)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'seller', 'driver');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'packed', 'shipped', 'delivered', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. TABLES
-- Profiles: Extends the default Supabase Auth
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role user_role DEFAULT 'customer',
  seller_balance NUMERIC(10,2) DEFAULT 0.00,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Warehouses
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT, -- Lucide icon name
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  discount_price NUMERIC(10,2),
  stock_quantity INTEGER DEFAULT 0,
  images JSONB DEFAULT '[]', -- Array of image URLs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES profiles(id) NOT NULL,
  seller_id UUID REFERENCES profiles(id) NOT NULL,
  driver_id UUID REFERENCES profiles(id),
  warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
  status order_status DEFAULT 'pending',
  total_amount NUMERIC(10,2) NOT NULL,
  shipping_address JSONB NOT NULL,
  pickup_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order Items (Line items for each order)
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price_at_purchase NUMERIC(10,2) NOT NULL
);

-- Cart Items (Persistent cart)
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id, order_id)
);

-- 3. ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (The "Security Guard" rules)
-- Warehouses: Anyone can read
CREATE POLICY "Warehouses are readable by everyone" ON warehouses FOR SELECT USING (true);

-- Categories: Anyone can read
CREATE POLICY "Categories are readable by everyone" ON categories FOR SELECT USING (true);

-- Products: Anyone can read, but only sellers can insert/update their own
CREATE POLICY "Products are readable by everyone" ON products FOR SELECT USING (true);
CREATE POLICY "Sellers can manage their own products" ON products 
  FOR ALL USING (auth.uid() = seller_id);

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can manage their own profile" ON profiles 
  FOR ALL USING (auth.uid() = id);

-- Orders: Customers can see their own, Drivers can see available/assigned, Sellers can see theirs
CREATE POLICY "Customers can see their own orders" ON orders 
  FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Sellers can manage their own orders" ON orders 
  FOR ALL USING (auth.uid() = seller_id);
CREATE POLICY "Drivers can see assigned orders" ON orders 
  FOR SELECT USING (auth.uid() = driver_id OR status = 'packed');

-- Cart: Users can manage their own cart
CREATE POLICY "Users can manage their own cart" ON cart_items 
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Reviews are readable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for products they bought" ON reviews 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. SEED DATA (Optional)
-- No pre-seeded data.


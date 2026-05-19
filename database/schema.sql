-- REAL ESTATE BOT - DATABASE SCHEMA


-- 1. PROPERTIES TABLE
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  type TEXT CHECK (type IN ('buy', 'rent')) NOT NULL,
  description TEXT,
  area_sqft INTEGER,
  amenities TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. LEADS TABLE
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  budget NUMERIC,
  location_preference TEXT,
  bedrooms INTEGER,
  deal_type TEXT CHECK (deal_type IN ('buy', 'rent')),
  timeline TEXT,
  classification TEXT CHECK (classification IN ('Hot', 'Warm', 'Cold')) DEFAULT 'Cold',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CONVERSATIONS TABLE
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SEED DATA: 15 Property Listings
-- ============================================

INSERT INTO properties (title, price, location, bedrooms, type, description, area_sqft, amenities) VALUES
('Modern Downtown Apartment', 85000, 'Lahore DHA Phase 5', 2, 'buy', 'Stunning modern apartment in the heart of DHA with floor-to-ceiling windows and premium finishes. Close to all amenities.', 1200, ARRAY['parking', 'gym', 'security', 'elevator']),
('Spacious Family Villa', 250000, 'Lahore DHA Phase 6', 4, 'buy', 'Elegant family villa with large garden, servant quarters, and double garage. Perfect for a growing family in a prime location.', 4500, ARRAY['garden', 'parking', 'servant quarters', 'security']),
('Luxury Penthouse', 420000, 'Lahore Gulberg III', 3, 'buy', 'Exclusive penthouse with panoramic city views, private terrace, and premium Italian fittings throughout.', 3200, ARRAY['terrace', 'gym', 'pool', 'concierge', 'parking']),
('Cozy Studio Apartment', 18000, 'Lahore Model Town', 1, 'buy', 'Perfect starter home or investment property. Well-maintained studio in a secure society with all utilities available.', 600, ARRAY['security', 'utilities']),
('Executive 3-Bed Flat', 145000, 'Lahore Bahria Town', 3, 'buy', 'Premium flat in Bahria Town with modern kitchen, built-in wardrobes, and access to all community facilities.', 2100, ARRAY['gym', 'pool', 'parking', 'security', 'community center']),
('Corner Plot House', 310000, 'Islamabad F-7', 5, 'buy', 'Massive corner plot house in Islamabad''s most sought-after sector. High ceilings, large rooms, and beautiful garden.', 6000, ARRAY['garden', 'parking', 'security', 'servant quarters']),
('Affordable 2-Bed Flat', 62000, 'Lahore Johar Town', 2, 'buy', 'Well-priced flat in a fast-developing area. Great investment potential with nearby schools and hospitals.', 1000, ARRAY['parking', 'security']),
('High-Rise City View', 195000, 'Karachi Clifton', 3, 'buy', 'Premium high-rise apartment in Clifton with sea views, rooftop access, and modern amenities throughout.', 2400, ARRAY['pool', 'gym', 'parking', 'security', 'rooftop']),
('Furnished Studio for Rent', 25000, 'Lahore DHA Phase 4', 1, 'rent', 'Fully furnished studio available immediately. All appliances included, bills negotiable. Perfect for a professional.', 550, ARRAY['furnished', 'utilities', 'security', 'parking']),
('2-Bed Apartment for Rent', 45000, 'Lahore Gulberg II', 2, 'rent', 'Bright and airy 2-bedroom apartment in central Gulberg. Recently renovated with new kitchen and bathrooms.', 1100, ARRAY['parking', 'security', 'generator']),
('Family Home for Rent', 75000, 'Lahore DHA Phase 2', 4, 'rent', 'Large family home available for rent with garden and outdoor space. Quiet street, excellent schools nearby.', 3500, ARRAY['garden', 'parking', 'security', 'servant quarters']),
('Office-to-Residential Loft', 110000, 'Lahore MM Alam Road', 2, 'rent', 'Unique converted loft with exposed brick, high ceilings, and open-plan living. Ultra-central location.', 1800, ARRAY['parking', 'security', 'rooftop']),
('3-Bed House for Rent', 60000, 'Islamabad G-11', 3, 'rent', 'Comfortable family house in a peaceful Islamabad sector. Large rooms, back yard, and safe neighborhood.', 2800, ARRAY['garden', 'parking', 'security']),
('Budget Studio Rental', 12000, 'Lahore Faisal Town', 1, 'rent', 'Affordable studio for students or single professionals. Close to University of Lahore and public transport.', 450, ARRAY['security', 'utilities']),
('Luxury Villa for Rent', 200000, 'Lahore DHA Phase 8', 5, 'rent', 'Grand luxury villa with private pool, home theater, and fully landscaped garden. Available for long-term rent.', 8000, ARRAY['pool', 'gym', 'garden', 'home theater', 'parking', 'security', 'servant quarters']);

-- Enable Row Level Security (RLS) - allow all for now
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on properties" ON properties FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);

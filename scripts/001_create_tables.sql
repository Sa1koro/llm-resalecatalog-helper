-- ResaleBox Database Schema
-- This is a single-user app, so we use simple tables without user_id

-- Settings table for global configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_name TEXT NOT NULL DEFAULT 'ResaleBox',
  location TEXT,
  moving_date DATE,
  admin_password TEXT NOT NULL DEFAULT 'resale2026',
  currency TEXT NOT NULL DEFAULT 'CAD', -- CAD, USD, CNY
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact methods table
CREATE TABLE IF NOT EXISTS contact_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL, -- wechat, xiaohongshu, phone, sms, facebook, discord, qq, custom
  value TEXT NOT NULL,
  label TEXT, -- display label like "微信号"
  enabled BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_zh TEXT NOT NULL,
  title_en TEXT,
  description_zh TEXT,
  description_en TEXT,
  category TEXT NOT NULL,
  original_price DECIMAL(10, 2),
  asking_price DECIMAL(10, 2) NOT NULL,
  condition TEXT NOT NULL DEFAULT 'good', -- like_new, good, fair
  status TEXT NOT NULL DEFAULT 'available', -- available, reserved, sold
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  bundle_id UUID,
  featured BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bundles table
CREATE TABLE IF NOT EXISTS bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_zh TEXT NOT NULL,
  name_en TEXT,
  description_zh TEXT,
  description_en TEXT,
  discount_percent INT DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for bundle_id
ALTER TABLE items 
ADD CONSTRAINT fk_bundle 
FOREIGN KEY (bundle_id) 
REFERENCES bundles(id) 
ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_bundle_id ON items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_items_featured ON items(featured);

-- Keep RLS enabled; policies are managed in separate migration scripts
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles ENABLE ROW LEVEL SECURITY;

-- Insert default settings
INSERT INTO settings (seller_name, location, moving_date, admin_password, currency)
VALUES ('ResaleBox', '', NOW() + INTERVAL '30 days', 'resale2026', 'CAD')
ON CONFLICT DO NOTHING;

-- Insert default contact methods
INSERT INTO contact_methods (platform, value, label, enabled, sort_order) VALUES
('wechat', '', '微信', false, 1),
('xiaohongshu', '', '小红书', false, 2),
('phone', '', '电话', false, 3),
('sms', '', '短信', false, 4),
('qq', '', 'QQ', false, 5),
('facebook', '', 'Facebook', false, 6),
('discord', '', 'Discord', false, 7)
ON CONFLICT DO NOTHING;

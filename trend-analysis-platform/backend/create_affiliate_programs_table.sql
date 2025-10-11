-- Create affiliate_programs table in Supabase
CREATE TABLE IF NOT EXISTS affiliate_programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    commission VARCHAR(50),
    cookie_duration VARCHAR(50),
    payment_terms VARCHAR(50),
    min_payout VARCHAR(50),
    category VARCHAR(100),
    rating FLOAT DEFAULT 0.0,
    estimated_earnings VARCHAR(100),
    difficulty VARCHAR(50),
    affiliate_network VARCHAR(100),
    tracking_method VARCHAR(100),
    payment_methods JSONB,
    support_level VARCHAR(50),
    promotional_materials JSONB,
    restrictions TEXT,
    source VARCHAR(50) DEFAULT 'web_search',
    search_terms JSONB,
    discovery_date TIMESTAMPTZ DEFAULT NOW(),
    last_used TIMESTAMPTZ,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_name ON affiliate_programs(name);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_category ON affiliate_programs(category);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_affiliate_network ON affiliate_programs(affiliate_network);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_is_active ON affiliate_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_search_terms ON affiliate_programs USING GIN(search_terms);

-- Create RLS policies
ALTER TABLE affiliate_programs ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON affiliate_programs
    FOR ALL USING (auth.role() = 'authenticated');

-- Allow read access for anonymous users (for public API)
CREATE POLICY "Allow read access for anonymous users" ON affiliate_programs
    FOR SELECT USING (true);


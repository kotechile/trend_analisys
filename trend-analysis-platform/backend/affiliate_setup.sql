-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Create affiliate_programs table
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

-- 2. Create affiliate_research table
CREATE TABLE IF NOT EXISTS affiliate_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    topic TEXT NOT NULL,
    search_query TEXT,
    results JSONB,
    total_programs_found INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_name ON affiliate_programs(name);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_category ON affiliate_programs(category);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_is_active ON affiliate_programs(is_active);
CREATE INDEX IF NOT EXISTS idx_affiliate_programs_search_terms ON affiliate_programs USING GIN(search_terms);

CREATE INDEX IF NOT EXISTS idx_affiliate_research_user_id ON affiliate_research(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_research_topic ON affiliate_research(topic);

-- 4. Enable RLS
ALTER TABLE affiliate_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_research ENABLE ROW LEVEL SECURITY;

-- 5. Set up RLS policies for affiliate_programs
CREATE POLICY "Allow read access for all" ON affiliate_programs
    FOR SELECT USING (true);

-- 6. Set up RLS policies for affiliate_research
CREATE POLICY "Users can see their own research" ON affiliate_research
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own research" ON affiliate_research
    FOR INSERT WITH CHECK (auth.uid() = user_id);

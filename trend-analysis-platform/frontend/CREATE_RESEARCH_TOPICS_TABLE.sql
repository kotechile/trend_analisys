-- Create research_topics table for Supabase
-- This migration creates the research_topics table that works with Supabase Auth
-- Run this in Supabase SQL Editor: https://sbcontent.aichieve.net/project/default/sql

-- =============================================================================
-- Step 1: Create users table (if it doesn't exist) that syncs with auth.users
-- =============================================================================

-- Create a public.users table that references auth.users
-- This allows us to have a users table in the public schema for foreign keys
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own record
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Create policy: Users can insert their own record
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create policy: Users can update their own record
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Function to automatically create user record when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- Step 2: Create research_topics table
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.research_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0)
);

-- Create unique constraint for research topic titles per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_research_topics_user_title 
ON public.research_topics(user_id, title);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_research_topics_user_id ON public.research_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_research_topics_status ON public.research_topics(status);
CREATE INDEX IF NOT EXISTS idx_research_topics_created_at ON public.research_topics(created_at);

-- Enable Row Level Security
ALTER TABLE public.research_topics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for research_topics
DROP POLICY IF EXISTS "Users can view their own research topics" ON public.research_topics;
CREATE POLICY "Users can view their own research topics" ON public.research_topics
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own research topics" ON public.research_topics;
CREATE POLICY "Users can insert their own research topics" ON public.research_topics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own research topics" ON public.research_topics;
CREATE POLICY "Users can update their own research topics" ON public.research_topics
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own research topics" ON public.research_topics;
CREATE POLICY "Users can delete their own research topics" ON public.research_topics
    FOR DELETE USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE public.research_topics IS 'Stores main research subjects with version control';
COMMENT ON COLUMN public.research_topics.title IS 'Research topic title (unique per user)';
COMMENT ON COLUMN public.research_topics.description IS 'Detailed description of the research topic';
COMMENT ON COLUMN public.research_topics.status IS 'Research topic status (active, completed, archived)';
COMMENT ON COLUMN public.research_topics.version IS 'Version number for optimistic concurrency control';

-- =============================================================================
-- Step 3: Create user record for existing auth users (if any)
-- =============================================================================

-- Insert existing auth users into public.users if they don't exist
INSERT INTO public.users (id, email, first_name, last_name)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'first_name', ''),
    COALESCE(raw_user_meta_data->>'last_name', '')
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;


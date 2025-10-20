-- Verify Supabase Setup
-- Run this in your Supabase SQL Editor to confirm everything is set up correctly

-- 1. Check DataForSEO tables exist and are secured
SELECT 
    'DataForSEO Tables' as category,
    tablename,
    CASE WHEN rowsecurity THEN '✅ SECURED' ELSE '❌ UNRESTRICTED' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('trend_analysis_data', 'keyword_research_data', 'subtopic_suggestions', 'dataforseo_api_logs')
ORDER BY tablename;

-- 2. Check RLS policies are created
SELECT 
    'RLS Policies' as category,
    tablename,
    policyname,
    cmd as operation,
    roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('trend_analysis_data', 'keyword_research_data', 'subtopic_suggestions', 'dataforseo_api_logs')
ORDER BY tablename, policyname;

-- 3. Check API credentials
SELECT 
    'API Credentials' as category,
    key_name,
    provider,
    CASE WHEN is_active THEN '✅ ACTIVE' ELSE '❌ INACTIVE' END as status,
    base_url
FROM api_keys 
WHERE provider = 'dataforseo'
ORDER BY created_at DESC;

-- 4. Check indexes are created
SELECT 
    'Indexes' as category,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('trend_analysis_data', 'keyword_research_data', 'subtopic_suggestions', 'dataforseo_api_logs')
ORDER BY tablename, indexname;

-- 5. Check views (these should be unrestricted but that's expected)
SELECT 
    'Views' as category,
    viewname as object_name,
    'VIEW (unrestricted - normal)' as status
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('api_performance_metrics', 'high_value_keywords', 'trending_subtopics')
ORDER BY viewname;

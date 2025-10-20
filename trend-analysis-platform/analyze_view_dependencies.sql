-- Analyze view dependencies to find underlying tables
-- Run this in your Supabase SQL Editor to see what tables the views depend on

-- Get the definition of each view
SELECT 
    'api_performance_metrics' as view_name,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'api_performance_metrics'

UNION ALL

SELECT 
    'high_value_keywords' as view_name,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'high_value_keywords'

UNION ALL

SELECT 
    'trending_subtopics' as view_name,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname = 'trending_subtopics';

-- Also check what tables exist in your database
SELECT 
    tablename,
    'TABLE' as object_type
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

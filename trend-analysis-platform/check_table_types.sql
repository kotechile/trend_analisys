-- Check if these are tables or views
SELECT 
    schemaname,
    tablename,
    tabletype,
    CASE 
        WHEN tabletype = 'r' THEN 'TABLE'
        WHEN tabletype = 'v' THEN 'VIEW'
        WHEN tabletype = 'm' THEN 'MATERIALIZED VIEW'
        ELSE 'OTHER'
    END as object_type
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('api_performance_metrics', 'high_value_keywords', 'trending_subtopics')
ORDER BY tablename;

-- Also check pg_views for views
SELECT 
    schemaname,
    viewname as tablename,
    'VIEW' as object_type
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('api_performance_metrics', 'high_value_keywords', 'trending_subtopics')
ORDER BY viewname;

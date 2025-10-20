-- Check what type of objects these are
SELECT 
    'TABLE' as object_type,
    schemaname,
    tablename as object_name,
    tabletype,
    CASE 
        WHEN tabletype = 'r' THEN 'REGULAR TABLE'
        WHEN tabletype = 'v' THEN 'VIEW'
        WHEN tabletype = 'm' THEN 'MATERIALIZED VIEW'
        ELSE 'OTHER'
    END as description
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('api_performance_metrics', 'high_value_keywords', 'trending_subtopics')

UNION ALL

SELECT 
    'VIEW' as object_type,
    schemaname,
    viewname as object_name,
    NULL as tabletype,
    'VIEW' as description
FROM pg_views 
WHERE schemaname = 'public' 
AND viewname IN ('api_performance_metrics', 'high_value_keywords', 'trending_subtopics')

ORDER BY object_name;

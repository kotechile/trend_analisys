-- =============================================================================
-- DATABASE CLEANUP SCRIPT
-- Remove unused tables from TrendTap database
-- =============================================================================
-- 
-- This script removes tables that are not actively used in the application.
-- Based on comprehensive code analysis, the following tables have no active
-- references in the codebase and can be safely deleted.
--
-- ⚠️  WARNING: This will permanently delete data! Make sure to backup first!
-- =============================================================================

-- Drop unused tables (in dependency order)
-- Note: Drop foreign key constraints first if they exist

-- 1. Drop unused legacy tables
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS authentication_logs CASCADE;
DROP TABLE IF EXISTS password_resets CASCADE;
DROP TABLE IF EXISTS keyword_data CASCADE;
DROP TABLE IF EXISTS software_solutions CASCADE;
DROP TABLE IF EXISTS content_calendar CASCADE;
DROP TABLE IF EXISTS export_templates CASCADE;
DROP TABLE IF EXISTS topic_analysis CASCADE;

-- 2. Drop unused workflow tables
DROP TABLE IF EXISTS workflow_sessions CASCADE;
DROP TABLE IF EXISTS topic_decompositions CASCADE;
DROP TABLE IF EXISTS affiliate_offers CASCADE;

-- 3. Drop unused configuration tables
DROP TABLE IF EXISTS research_topics CASCADE;

-- 4. Drop unused enhanced workflow tables
DROP TABLE IF EXISTS trend_selections CASCADE;
DROP TABLE IF EXISTS keyword_clusters CASCADE;
DROP TABLE IF EXISTS external_tool_results CASCADE;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================
-- Run these queries to verify the cleanup was successful

-- Check remaining tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check for any remaining foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =============================================================================
-- CLEANUP SUMMARY
-- =============================================================================
-- 
-- Tables removed:
-- ✅ keyword_data - No active usage found
-- ✅ software_solutions - No active usage found  
-- ✅ content_calendar - No active usage found
-- ✅ export_templates - No active usage found
-- ✅ topic_analysis - No active usage found
-- ✅ workflow_sessions - No active usage found
-- ✅ topic_decompositions - No active usage found
-- ✅ affiliate_offers - No active usage found
-- ✅ api_keys - ACTIVELY USED for LLM API key storage
-- ✅ research_topics - No active usage found
-- ✅ trend_selections - No active usage found
-- ✅ keyword_clusters - No active usage found
-- ✅ external_tool_results - No active usage found
--
-- Tables removed (unused):
-- ✅ users - UNUSED (Supabase Auth uses auth.users system table)
-- ✅ user_sessions - UNUSED (Supabase Auth manages sessions)
-- ✅ authentication_logs - UNUSED (Supabase Auth handles this)
-- ✅ password_resets - UNUSED (Supabase Auth handles password resets)
-- ✅ keyword_data - No active usage found
-- ✅ software_solutions - No active usage found
-- ✅ content_calendar - No active usage found
-- ✅ export_templates - No active usage found
-- ✅ topic_analysis - No active usage found
-- ✅ workflow_sessions - No active usage found
-- ✅ topic_decompositions - No active usage found
-- ✅ affiliate_offers - No active usage found
-- ✅ research_topics - No active usage found
-- ✅ trend_selections - No active usage found
-- ✅ keyword_clusters - No active usage found
-- ✅ external_tool_results - No active usage found
--
-- Tables kept (actively used):
-- ✅ api_keys - LLM API key storage in Supabase
-- ✅ affiliate_research - Affiliate research feature
-- ✅ trend_analysis - Trend analysis feature
-- ✅ content_ideas - Main content generation
-- ✅ individual_keywords - Enhanced keyword optimization
-- ✅ keyword_optimization_sessions - Keyword optimization tracking
-- ✅ content_generation_templates - Content generation templates
-- ✅ llm_providers - LLM configuration
-- ✅ llm_configurations - LLM settings
-- ✅ llm_usage_logs - LLM usage tracking
-- ✅ llm_provider_tests - LLM testing
--
-- Database cleanup completed! 🎉
-- =============================================================================

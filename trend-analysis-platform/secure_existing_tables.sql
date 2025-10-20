-- SQL Script: Secure Existing Unrestricted Tables
-- Description: Enables RLS and creates policies for existing tables
-- Run this in your Supabase SQL Editor
-- Created: 2024-01-15

-- Enable RLS on existing unrestricted tables
ALTER TABLE api_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE high_value_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE trending_subtopics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_performance_metrics
-- Allow authenticated users to read all performance metrics
CREATE POLICY "Allow authenticated users to read API performance metrics" ON api_performance_metrics
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert performance metrics
CREATE POLICY "Allow authenticated users to insert API performance metrics" ON api_performance_metrics
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update performance metrics
CREATE POLICY "Allow authenticated users to update API performance metrics" ON api_performance_metrics
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete performance metrics
CREATE POLICY "Allow authenticated users to delete API performance metrics" ON api_performance_metrics
    FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for high_value_keywords
-- Allow authenticated users to read all high value keywords
CREATE POLICY "Allow authenticated users to read high value keywords" ON high_value_keywords
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert high value keywords
CREATE POLICY "Allow authenticated users to insert high value keywords" ON high_value_keywords
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update high value keywords
CREATE POLICY "Allow authenticated users to update high value keywords" ON high_value_keywords
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete high value keywords
CREATE POLICY "Allow authenticated users to delete high value keywords" ON high_value_keywords
    FOR DELETE
    TO authenticated
    USING (true);

-- RLS Policies for trending_subtopics
-- Allow authenticated users to read all trending subtopics
CREATE POLICY "Allow authenticated users to read trending subtopics" ON trending_subtopics
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert trending subtopics
CREATE POLICY "Allow authenticated users to insert trending subtopics" ON trending_subtopics
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update trending subtopics
CREATE POLICY "Allow authenticated users to update trending subtopics" ON trending_subtopics
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to delete trending subtopics
CREATE POLICY "Allow authenticated users to delete trending subtopics" ON trending_subtopics
    FOR DELETE
    TO authenticated
    USING (true);

-- Add comments for documentation
COMMENT ON POLICY "Allow authenticated users to read API performance metrics" ON api_performance_metrics IS 'Allows authenticated users to read all API performance metrics';
COMMENT ON POLICY "Allow authenticated users to insert API performance metrics" ON api_performance_metrics IS 'Allows authenticated users to insert new API performance metrics';
COMMENT ON POLICY "Allow authenticated users to update API performance metrics" ON api_performance_metrics IS 'Allows authenticated users to update existing API performance metrics';
COMMENT ON POLICY "Allow authenticated users to delete API performance metrics" ON api_performance_metrics IS 'Allows authenticated users to delete API performance metrics';

COMMENT ON POLICY "Allow authenticated users to read high value keywords" ON high_value_keywords IS 'Allows authenticated users to read all high value keywords';
COMMENT ON POLICY "Allow authenticated users to insert high value keywords" ON high_value_keywords IS 'Allows authenticated users to insert new high value keywords';
COMMENT ON POLICY "Allow authenticated users to update high value keywords" ON high_value_keywords IS 'Allows authenticated users to update existing high value keywords';
COMMENT ON POLICY "Allow authenticated users to delete high value keywords" ON high_value_keywords IS 'Allows authenticated users to delete high value keywords';

COMMENT ON POLICY "Allow authenticated users to read trending subtopics" ON trending_subtopics IS 'Allows authenticated users to read all trending subtopics';
COMMENT ON POLICY "Allow authenticated users to insert trending subtopics" ON trending_subtopics IS 'Allows authenticated users to insert new trending subtopics';
COMMENT ON POLICY "Allow authenticated users to update trending subtopics" ON trending_subtopics IS 'Allows authenticated users to update existing trending subtopics';
COMMENT ON POLICY "Allow authenticated users to delete trending subtopics" ON trending_subtopics IS 'Allows authenticated users to delete trending subtopics';

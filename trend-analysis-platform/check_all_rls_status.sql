-- SQL Script: Check RLS Status for All Tables
-- Description: Verifies RLS is enabled on all tables and shows policy details
-- Run this in your Supabase SQL Editor after applying the security migration
-- Created: 2024-01-15

-- Check RLS status for all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ SECURED'
        ELSE '❌ UNRESTRICTED'
    END as security_status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Check RLS policies for all tables
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;

-- Count policies per table
SELECT 
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(cmd, ', ') as operations_allowed
FROM pg_policies 
WHERE schemaname = 'public' 
GROUP BY tablename
ORDER BY tablename;

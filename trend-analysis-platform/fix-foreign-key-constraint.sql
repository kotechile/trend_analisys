-- Fix Foreign Key Constraint to Reference auth.users
-- Run this in Supabase SQL Editor

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE research_topics 
DROP CONSTRAINT IF EXISTS research_topics_user_id_fkey;

-- Step 2: Add new foreign key constraint to auth.users
ALTER TABLE research_topics 
ADD CONSTRAINT research_topics_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 3: Verify the constraint was created
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='research_topics';

-- Step 4: Test the constraint with a sample insert
-- This should work if the user exists in auth.users
INSERT INTO research_topics (title, description, status, user_id, version)
VALUES ('Test Topic', 'Test description', 'active', 'f248b7ed-b8df-4464-8544-8304d7ae4c30', 1)
ON CONFLICT DO NOTHING;

-- Step 5: Clean up the test record
DELETE FROM research_topics WHERE title = 'Test Topic';

-- Optional: Drop the custom users table if no longer needed
-- (Only do this if you're sure you don't need it)
-- DROP TABLE IF EXISTS users CASCADE;

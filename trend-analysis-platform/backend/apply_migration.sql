-- Quick fix: Add missing columns to keyword_research_data table
ALTER TABLE keyword_research_data 
ADD COLUMN IF NOT EXISTS topic_id UUID,
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_keyword_research_data_topic_id ON keyword_research_data(topic_id);
CREATE INDEX IF NOT EXISTS idx_keyword_research_data_user_id ON keyword_research_data(user_id);
CREATE INDEX IF NOT EXISTS idx_keyword_research_data_user_topic ON keyword_research_data(user_id, topic_id);

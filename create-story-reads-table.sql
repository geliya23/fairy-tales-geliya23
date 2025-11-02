-- ================================================================
-- Database Extension for Analytics
-- Change ID: enhance-ai-edge-analytics-admin
-- Phase 1: Database Extension
-- ================================================================

-- Task 1: Create story_reads table
-- This table tracks story reading events for analytics

CREATE TABLE IF NOT EXISTS story_reads (
    id BIGSERIAL PRIMARY KEY,
    story_id BIGINT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
    user_identifier TEXT NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task 2: Create database indexes for performance optimization
-- These indexes optimize common query patterns for analytics

-- Index for story-based queries with time ordering
CREATE INDEX IF NOT EXISTS idx_story_reads_story_id_read_at
    ON story_reads (story_id, read_at DESC);

-- Index for user-based analytics
CREATE INDEX IF NOT EXISTS idx_story_reads_user_identifier
    ON story_reads (user_identifier);

-- Index for time-range queries
CREATE INDEX IF NOT EXISTS idx_story_reads_read_at
    ON story_reads (read_at DESC);

-- Composite index for user activity tracking
CREATE INDEX IF NOT EXISTS idx_story_reads_user_time
    ON story_reads (user_identifier, read_at DESC);

-- Task 3: Configure Row Level Security (RLS) policies
-- Enable RLS on story_reads table
ALTER TABLE story_reads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access (for analytics aggregation)
-- Policy: Allow public insert (for tracking read events)
CREATE POLICY "Allow public read access on story_reads"
    ON story_reads FOR SELECT
    TO public
    USING (true);

CREATE POLICY "Allow public insert on story_reads"
    ON story_reads FOR INSERT
    TO public
    WITH CHECK (true);

-- Optional: Allow public delete for cleanup (only if needed)
-- CREATE POLICY "Allow public delete on story_reads"
--     ON story_reads FOR DELETE
--     TO public
--     USING (true);

-- Task 4: Create optional cleanup triggers
-- Trigger: Auto-update updated_at timestamp (optional, for tracking record modifications)

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION update_story_reads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    -- This is optional since we mainly track created_at
    -- Uncomment if you want to track updates
    -- NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create trigger for updated_at
-- CREATE TRIGGER trigger_update_story_reads_updated_at
--     BEFORE UPDATE ON story_reads
--     FOR EACH ROW
--     EXECUTE FUNCTION update_story_reads_updated_at();

-- ================================================================
-- Task 5: Verification queries (for testing)
-- ================================================================

-- Check table structure
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'story_reads'
ORDER BY ordinal_position;

-- Check indexes
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'story_reads'
ORDER BY indexname;

-- Check RLS status
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'story_reads';

-- Check RLS policies
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'story_reads';

-- ================================================================
-- Task 6: Sample test data (for testing)
-- ================================================================

-- Test inserts (optional - for testing only)
-- These can be run to verify the table works correctly

/*
INSERT INTO story_reads (story_id, user_identifier, user_agent, referrer)
VALUES
    (1, '192.168.1.1', 'Mozilla/5.0...', 'https://google.com'),
    (1, '192.168.1.2', 'Mozilla/5.0...', NULL),
    (2, '192.168.1.1', 'Mozilla/5.0...', 'https://google.com');

-- Verify test data
SELECT * FROM story_reads ORDER BY read_at DESC LIMIT 5;
*/

-- ================================================================
-- End of SQL Script
-- ================================================================

-- Success message
SELECT 'story_reads table created successfully with indexes and RLS policies' as message;

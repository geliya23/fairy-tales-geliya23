-- ================================================================
-- Analytics Functions for Edge Functions
-- Change ID: enhance-ai-edge-analytics-admin
-- Phase 2: Edge Functions Support
-- ================================================================

-- Function: get_top_stories
-- Description: Get top stories by read count in a given period
CREATE OR REPLACE FUNCTION get_top_stories(
    p_interval TEXT DEFAULT '7 days',
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    id BIGINT,
    title TEXT,
    read_count BIGINT,
    unique_readers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.title,
        COUNT(r.id) as read_count,
        COUNT(DISTINCT r.user_identifier) as unique_readers
    FROM stories s
    LEFT JOIN story_reads r ON s.id = r.story_id
    WHERE r.read_at >= NOW() - p_interval::INTERVAL
    GROUP BY s.id, s.title
    ORDER BY read_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function: get_time_series_data
-- Description: Get daily read counts for the last N days
CREATE OR REPLACE FUNCTION get_time_series_data(
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    reads BIGINT,
    unique_readers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE_TRUNC('day', r.read_at)::DATE as date,
        COUNT(r.id) as reads,
        COUNT(DISTINCT r.user_identifier) as unique_readers
    FROM story_reads r
    WHERE r.read_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY DATE_TRUNC('day', r.read_at)
    ORDER BY date;
END;
$$ LANGUAGE plpgsql;

-- Function: get_story_read_trend
-- Description: Get daily read counts for a specific story
CREATE OR REPLACE FUNCTION get_story_read_trend(
    p_story_id BIGINT,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    date DATE,
    reads BIGINT,
    unique_readers BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE_TRUNC('day', r.read_at)::DATE as date,
        COUNT(r.id) as reads,
        COUNT(DISTINCT r.user_identifier) as unique_readers
    FROM story_reads r
    WHERE r.story_id = p_story_id
        AND r.read_at >= NOW() - (p_days || ' days')::INTERVAL
    GROUP BY DATE_TRUNC('day', r.read_at)
    ORDER BY date;
END;
$$ LANGUAGE plpgsql;

-- Function: get_story_stats
-- Description: Get comprehensive statistics for a story
CREATE OR REPLACE FUNCTION get_story_stats(
    p_story_id BIGINT,
    p_interval TEXT DEFAULT '30 days'
)
RETURNS TABLE (
    total_reads BIGINT,
    unique_readers BIGINT,
    first_read_at TIMESTAMP WITH TIME ZONE,
    last_read_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(r.id) as total_reads,
        COUNT(DISTINCT r.user_identifier) as unique_readers,
        MIN(r.read_at) as first_read_at,
        MAX(r.read_at) as last_read_at
    FROM story_reads r
    WHERE r.story_id = p_story_id
        AND r.read_at >= NOW() - p_interval::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on functions (optional, for additional security)
-- ALTER FUNCTION get_top_stories(TEXT, INTEGER) SECURITY DEFINER;
-- ALTER FUNCTION get_time_series_data(INTEGER) SECURITY DEFINER;
-- ALTER FUNCTION get_story_read_trend(BIGINT, INTEGER) SECURITY DEFINER;
-- ALTER FUNCTION get_story_stats(BIGINT, TEXT) SECURITY DEFINER;

-- Grant execute permissions to anon and authenticated users
GRANT EXECUTE ON FUNCTION get_top_stories(TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_top_stories(TEXT, INTEGER) TO authenticated;

GRANT EXECUTE ON FUNCTION get_time_series_data(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_time_series_data(INTEGER) TO authenticated;

GRANT EXECUTE ON FUNCTION get_story_read_trend(BIGINT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_story_read_trend(BIGINT, INTEGER) TO authenticated;

GRANT EXECUTE ON FUNCTION get_story_stats(BIGINT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_story_stats(BIGINT, TEXT) TO authenticated;

-- Success message
SELECT 'Analytics functions created successfully!' as message;

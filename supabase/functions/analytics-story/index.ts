/**
 * Edge Function: Analytics Story Detail
 * Description: Get detailed analytics for a specific story
 *
 * This function provides detailed statistics about a specific story,
 * including total reads, unique readers, and read trends over time.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface StoryDetailRequest {
  period?: string; // e.g., '7d', '30d', '90d'
}

interface StoryDetailResponse {
  success: boolean;
  data?: {
    story_id: number;
    title: string;
    total_reads: number;
    unique_readers: number;
    first_read_at: string | null;
    last_read_at: string | null;
    avg_reads_per_day: number;
    read_trend: Array<{
      date: string;
      reads: number;
      unique_readers: number;
    }>;
    top_referrers: Array<{
      referrer: string;
      count: number;
    }>;
    reader_distribution: Array<{
      user_identifier: string;
      read_count: number;
      first_read: string;
      last_read: string;
    }>;
    period: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Parse period string to PostgreSQL interval
 */
function parsePeriod(period?: string): { interval: string; label: string } {
  const defaultPeriod = '30d';

  if (!period) {
    return { interval: "30 days", label: '30d' };
  }

  // Parse period format (e.g., '7d', '30d', '90d')
  const match = period.match(/^(\d+)([dwm])$/);
  if (!match) {
    return { interval: "30 days", label: '30d' };
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 'd':
      return { interval: `${value} days`, label: period };
    case 'w':
      return { interval: `${value * 7} days`, label: period };
    case 'm':
      return { interval: `${value * 30} days`, label: period };
    default:
      return { interval: "30 days", label: '30d' };
  }
}

/**
 * Extract story ID from URL path
 */
function extractStoryId(url: string): number | null {
  // URL format: /functions/v1/analytics-story/{id}
  const match = url.match(/\/analytics-story\/(\d+)/);
  if (match) {
    return parseInt(match[1]);
  }
  return null;
}

/**
 * Check if story exists and get its title
 */
async function getStoryInfo(storyId: number): Promise<{ id: number; title: string } | null> {
  const { data, error } = await supabase
    .from('stories')
    .select('id, title')
    .eq('id', storyId)
    .single();

  if (error) {
    console.error('Error fetching story:', error);
    return null;
  }

  return data;
}

/**
 * Get story statistics
 */
async function getStoryStats(storyId: number, interval: string) {
  // Total reads in period
  const { count: totalReads, error: readsError } = await supabase
    .from('story_reads')
    .select('*', { count: 'exact', head: true })
    .eq('story_id', storyId)
    .gte('read_at', new Date(Date.now() - parseIntervalToMs(interval)).toISOString());

  if (readsError) {
    console.error('Error fetching total reads:', readsError);
  }

  // Unique readers in period
  const { count: uniqueReaders, error: readersError } = await supabase
    .from('story_reads')
    .select('user_identifier', { count: 'exact', head: true })
    .eq('story_id', storyId)
    .gte('read_at', new Date(Date.now() - parseIntervalToMs(interval)).toISOString());

  if (readersError) {
    console.error('Error fetching unique readers:', readersError);
  }

  // First and last read
  const { data: firstRead, error: firstError } = await supabase
    .from('story_reads')
    .select('read_at')
    .eq('story_id', storyId)
    .order('read_at', { ascending: true })
    .limit(1)
    .single();

  if (firstError && firstError.code !== 'PGRST116') {
    console.error('Error fetching first read:', firstError);
  }

  const { data: lastRead, error: lastError } = await supabase
    .from('story_reads')
    .select('read_at')
    .eq('story_id', storyId)
    .order('read_at', { ascending: false })
    .limit(1)
    .single();

  if (lastError && lastError.code !== 'PGRST116') {
    console.error('Error fetching last read:', lastError);
  }

  return {
    total_reads: totalReads || 0,
    unique_readers: uniqueReaders || 0,
    first_read_at: firstRead?.read_at || null,
    last_read_at: lastRead?.read_at || null,
  };
}

/**
 * Get read trend over time
 */
async function getReadTrend(storyId: number, interval: string) {
  // Calculate number of days
  const days = parseIntervalToMs(interval) / (1000 * 60 * 60 * 24);

  const { data, error } = await supabase
    .rpc('get_story_read_trend', {
      p_story_id: storyId,
      p_days: days,
    });

  if (error) {
    console.error('Error fetching read trend:', error);
    // Fallback: return empty array
    return [];
  }

  return data || [];
}

/**
 * Get top referrers
 */
async function getTopReferrers(storyId: number, limit: number = 10) {
  const { data, error } = await supabase
    .from('story_reads')
    .select('referrer')
    .eq('story_id', storyId)
    .not('referrer', 'is', null);

  if (error) {
    console.error('Error fetching referrers:', error);
    return [];
  }

  // Aggregate referrer counts
  const referrerMap = new Map<string, number>();
  data.forEach((row: any) => {
    const referrer = row.referrer || 'direct';
    referrerMap.set(referrer, (referrerMap.get(referrer) || 0) + 1);
  });

  // Convert to array and sort
  return Array.from(referrerMap.entries())
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get reader distribution
 */
async function getReaderDistribution(storyId: number, limit: number = 50) {
  const { data, error } = await supabase
    .from('story_reads')
    .select('user_identifier, read_at')
    .eq('story_id', storyId)
    .order('read_at', { ascending: false });

  if (error) {
    console.error('Error fetching reader distribution:', error);
    return [];
  }

  // Aggregate by user
  const userMap = new Map<string, { count: number; first_read: string; last_read: string }>();
  data.forEach((row: any) => {
    const userId = row.user_identifier;
    const readAt = row.read_at;

    if (!userMap.has(userId)) {
      userMap.set(userId, {
        count: 0,
        first_read: readAt,
        last_read: readAt,
      });
    }

    const userData = userMap.get(userId)!;
    userData.count += 1;
    if (readAt < userData.first_read) {
      userData.first_read = readAt;
    }
    if (readAt > userData.last_read) {
      userData.last_read = readAt;
    }
  });

  // Convert to array and sort by read count
  return Array.from(userMap.entries())
    .map(([user_identifier, data]) => ({
      user_identifier,
      read_count: data.count,
      first_read: data.first_read,
      last_read: data.last_read,
    }))
    .sort((a, b) => b.read_count - a.read_count)
    .slice(0, limit);
}

/**
 * Helper function to convert interval string to milliseconds
 */
function parseIntervalToMs(interval: string): number {
  const match = interval.match(/^(\d+)\s+days$/);
  if (!match) {
    return 30 * 24 * 60 * 60 * 1000; // Default 30 days
  }

  const days = parseInt(match[1]);
  return days * 24 * 60 * 60 * 1000;
}

/**
 * Main request handler
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Only GET method is allowed',
          },
        } as StoryDetailResponse),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Extract story ID from URL
    const storyId = extractStoryId(req.url);
    if (!storyId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_STORY_ID',
            message: 'Story ID not found in URL path',
          },
        } as StoryDetailResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || '30d';

    // Parse period
    const { interval, label } = parsePeriod(period);

    // Check if story exists
    const storyInfo = await getStoryInfo(storyId);
    if (!storyInfo) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'STORY_NOT_FOUND',
            message: `Story with id ${storyId} does not exist`,
          },
        } as StoryDetailResponse),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch data in parallel
    const [storyStats, readTrend, topReferrers, readerDistribution] = await Promise.all([
      getStoryStats(storyId, interval),
      getReadTrend(storyId, interval),
      getTopReferrers(storyId, 10),
      getReaderDistribution(storyId, 50),
    ]);

    // Calculate average reads per day
    const days = parseIntervalToMs(interval) / (1000 * 60 * 60 * 24);
    const avgReadsPerDay = days > 0 ? storyStats.total_reads / days : 0;

    // Return success response
    const response: StoryDetailResponse = {
      success: true,
      data: {
        story_id: storyInfo.id,
        title: storyInfo.title,
        ...storyStats,
        avg_reads_per_day: parseFloat(avgReadsPerDay.toFixed(2)),
        read_trend: readTrend,
        top_referrers: topReferrers,
        reader_distribution: readerDistribution,
        period: label,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching story analytics:', error);

    const errorResponse: StoryDetailResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message,
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

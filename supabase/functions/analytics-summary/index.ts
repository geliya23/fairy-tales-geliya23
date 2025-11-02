/**
 * Edge Function: Analytics Summary
 * Description: Get analytics summary for stories
 *
 * This function provides aggregated statistics about story readings,
 * including popular stories, total reads, and time-series data.
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

interface SummaryRequest {
  period?: string; // e.g., '7d', '30d', '90d'
  limit?: number;
}

interface StorySummary {
  id: number;
  title: string;
  read_count: number;
  unique_readers: number;
}

interface TimeSeriesData {
  date: string;
  reads: number;
  unique_readers: number;
}

interface SummaryResponse {
  success: boolean;
  data?: {
    total_reads: number;
    unique_readers: number;
    total_stories: number;
    top_stories: StorySummary[];
    time_series: TimeSeriesData[];
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
  const defaultPeriod = '7d';

  if (!period) {
    return { interval: "7 days", label: '7d' };
  }

  // Parse period format (e.g., '7d', '30d', '90d')
  const match = period.match(/^(\d+)([dwm])$/);
  if (!match) {
    return { interval: "7 days", label: '7d' };
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
      return { interval: "7 days", label: '7d' };
  }
}

/**
 * Get top stories by read count
 */
async function getTopStories(
  supabaseClient: typeof supabase,
  interval: string,
  limit: number
): Promise<StorySummary[]> {
  const { data, error } = await supabaseClient
    .rpc('get_top_stories', {
      p_interval: interval,
      p_limit: limit,
    });

  if (error) {
    console.error('Error fetching top stories:', error);
    // Fallback to manual query
    const { data: fallbackData, error: fallbackError } = await supabaseClient
      .from('story_reads')
      .select(`
        story_id,
        stories!inner(id, title),
        user_identifier
      `)
      .gte('read_at', new Date(Date.now() - parseIntervalToMs(interval)).toISOString());

    if (fallbackError) {
      throw fallbackError;
    }

    // Aggregate data
    const storyMap = new Map<number, { title: string; reads: Set<string> }>();
    fallbackData.forEach((row: any) => {
      const storyId = row.story_id;
      const title = row.stories.title;
      const userId = row.user_identifier;

      if (!storyMap.has(storyId)) {
        storyMap.set(storyId, { title, reads: new Set() });
      }
      storyMap.get(storyId)!.reads.add(userId);
    });

    // Convert to array and sort
    const results: StorySummary[] = Array.from(storyMap.entries())
      .map(([id, data]) => ({
        id,
        title: data.title,
        read_count: data.reads.size,
        unique_readers: data.reads.size,
      }))
      .sort((a, b) => b.read_count - a.read_count)
      .slice(0, limit);

    return results;
  }

  return data || [];
}

/**
 * Get total statistics
 */
async function getTotalStats(supabaseClient: typeof supabase, interval: string) {
  // Total reads in period
  const { count: totalReads, error: readsError } = await supabaseClient
    .from('story_reads')
    .select('*', { count: 'exact', head: true })
    .gte('read_at', new Date(Date.now() - parseIntervalToMs(interval)).toISOString());

  if (readsError) {
    console.error('Error fetching total reads:', readsError);
  }

  // Unique readers in period
  const { count: uniqueReaders, error: readersError } = await supabaseClient
    .from('story_reads')
    .select('user_identifier', { count: 'exact', head: true })
    .gte('read_at', new Date(Date.now() - parseIntervalToMs(interval)).toISOString());

  if (readersError) {
    console.error('Error fetching unique readers:', readersError);
  }

  // Total stories
  const { count: totalStories, error: storiesError } = await supabaseClient
    .from('stories')
    .select('*', { count: 'exact', head: true });

  if (storiesError) {
    console.error('Error fetching total stories:', storiesError);
  }

  return {
    total_reads: totalReads || 0,
    unique_readers: uniqueReaders || 0,
    total_stories: totalStories || 0,
  };
}

/**
 * Get time series data
 */
async function getTimeSeriesData(
  supabaseClient: typeof supabase,
  interval: string
): Promise<TimeSeriesData[]> {
  // Calculate number of days
  const days = parseIntervalToMs(interval) / (1000 * 60 * 60 * 24);

  const { data, error } = await supabaseClient
    .rpc('get_time_series_data', {
      p_days: days,
    });

  if (error) {
    console.error('Error fetching time series data:', error);
    // Fallback: return empty array
    return [];
  }

  return data || [];
}

/**
 * Helper function to convert interval string to milliseconds
 */
function parseIntervalToMs(interval: string): number {
  const match = interval.match(/^(\d+)\s+days$/);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000; // Default 7 days
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
        } as SummaryResponse),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const period = url.searchParams.get('period') || '7d';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Validate limit
    if (limit < 1 || limit > 100) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'limit must be between 1 and 100',
          },
        } as SummaryResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse period
    const { interval, label } = parsePeriod(period);

    // Fetch data in parallel
    const [topStories, totalStats, timeSeries] = await Promise.all([
      getTopStories(supabase, interval, limit),
      getTotalStats(supabase, interval),
      getTimeSeriesData(supabase, interval),
    ]);

    // Return success response
    const response: SummaryResponse = {
      success: true,
      data: {
        ...totalStats,
        top_stories: topStories,
        time_series: timeSeries,
        period: label,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error fetching analytics summary:', error);

    const errorResponse: SummaryResponse = {
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

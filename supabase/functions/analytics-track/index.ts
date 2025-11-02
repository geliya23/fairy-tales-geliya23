/**
 * Edge Function: Analytics Track
 * Description: Track story reading events for analytics
 *
 * This function accepts a story_id and user_identifier and records
 * a reading event in the story_reads table.
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

interface TrackRequest {
  story_id: number;
  user_identifier?: string;
  user_agent?: string;
  referrer?: string;
}

interface TrackResponse {
  success: boolean;
  data?: {
    id: number;
    story_id: number;
    user_identifier: string;
    read_at: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Get client IP address
 */
function getClientIP(request: Request): string {
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const xRealIp = request.headers.get('x-real-ip');

  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }

  if (xRealIp) {
    return xRealIp;
  }

  return 'unknown';
}

/**
 * Generate anonymous user identifier
 */
function generateUserIdentifier(request: Request, providedId?: string): string {
  if (providedId) {
    return providedId;
  }

  // Use IP address as user identifier
  return getClientIP(request);
}

/**
 * Validate input parameters
 */
function validateInput(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  if (!body.story_id || typeof body.story_id !== 'number') {
    return { valid: false, error: 'story_id is required and must be a number' };
  }

  if (body.story_id <= 0) {
    return { valid: false, error: 'story_id must be a positive number' };
  }

  if (body.user_identifier && typeof body.user_identifier !== 'string') {
    return { valid: false, error: 'user_identifier must be a string if provided' };
  }

  if (body.user_identifier && body.user_identifier.length > 255) {
    return { valid: false, error: 'user_identifier must not exceed 255 characters' };
  }

  return { valid: true };
}

/**
 * Check if story exists
 */
async function checkStoryExists(storyId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('stories')
    .select('id')
    .eq('id', storyId)
    .single();

  return !error && data !== null;
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
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'METHOD_NOT_ALLOWED',
            message: 'Only POST method is allowed',
          },
        } as TrackResponse),
        {
          status: 405,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const requestData: TrackRequest = await req.json();

    // Validate input
    const validation = validateInput(requestData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: validation.error,
          },
        } as TrackResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { story_id } = requestData;

    // Check if story exists
    const storyExists = await checkStoryExists(story_id);
    if (!storyExists) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'STORY_NOT_FOUND',
            message: `Story with id ${story_id} does not exist`,
          },
        } as TrackResponse),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Generate user identifier
    const user_identifier = generateUserIdentifier(req, requestData.user_identifier);

    // Prepare record data
    const recordData = {
      story_id: story_id,
      user_identifier: user_identifier,
      user_agent: requestData.user_agent || req.headers.get('user-agent') || null,
      referrer: requestData.referrer || req.headers.get('referer') || null,
    };

    // Insert record into story_reads table
    const { data: insertData, error: insertError } = await supabase
      .from('story_reads')
      .insert(recordData)
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Failed to record reading event',
          },
        } as TrackResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Return success response
    const response: TrackResponse = {
      success: true,
      data: {
        id: insertData.id,
        story_id: insertData.story_id,
        user_identifier: insertData.user_identifier,
        read_at: insertData.read_at,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error tracking reading event:', error);

    const errorResponse: TrackResponse = {
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

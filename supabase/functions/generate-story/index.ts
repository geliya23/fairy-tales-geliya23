/**
 * Edge Function: Generate Story
 * Description: AI-powered story generation using OpenAI-compatible API
 *
 * This function accepts a prompt and generates a fairy tale story
 * using OpenAI's API. The generated story is automatically saved
 * to the database.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// OpenAI Configuration
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const OPENAI_BASE_URL = Deno.env.get('OPENAI_BASE_URL') || 'https://api.openai.com/v1';
const OPENAI_MODEL = Deno.env.get('OPENAI_MODEL') || 'gpt-3.5-turbo';

interface GenerateStoryRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface StoryResponse {
  success: boolean;
  data?: {
    id: number;
    title: string;
    content: string;
    created_at: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * Validate input parameters
 */
function validateInput(body: any): { valid: boolean; error?: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required' };
  }

  if (!body.prompt || typeof body.prompt !== 'string') {
    return { valid: false, error: 'prompt is required and must be a string' };
  }

  if (body.prompt.length < 10) {
    return { valid: false, error: 'prompt must be at least 10 characters long' };
  }

  if (body.prompt.length > 1000) {
    return { valid: false, error: 'prompt must not exceed 1000 characters' };
  }

  return { valid: true };
}

/**
 * Generate story using OpenAI-compatible API
 */
async function generateStory(prompt: string, model: string, temperature: number, maxTokens: number): Promise<string> {
  const messages = [
    {
      role: 'system',
      content: 'You are a creative fairy tale writer. Write engaging, age-appropriate stories with clear beginning, middle, and end. Use simple language and include moral lessons.'
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

/**
 * Extract title from generated story
 */
function extractTitle(content: string): string {
  // Try to find title in the first line
  const lines = content.split('\n');
  const firstLine = lines[0].trim();

  // If first line is short (less than 50 chars), use it as title
  if (firstLine.length < 50 && firstLine.length > 3) {
    return firstLine.replace(/^#+\s*/, '').trim();
  }

  // Otherwise, create a title from the first sentence
  const firstSentence = content.split(/[.!?]/)[0].trim();
  if (firstSentence.length < 50) {
    return firstSentence;
  }

  // Fallback
  return 'AI Generated Story';
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
    // Parse request body
    const requestData: GenerateStoryRequest = await req.json();

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
        } as StoryResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { prompt } = requestData;
    const model = requestData.model || OPENAI_MODEL;
    const temperature = requestData.temperature || 0.8;
    const maxTokens = requestData.max_tokens || 2000;

    // Generate story using OpenAI
    const generatedContent = await generateStory(prompt, model, temperature, maxTokens);

    // Extract title
    const title = extractTitle(generatedContent);

    // Create filename (sanitized title)
    const filename = title
      .toLowerCase()
      .replace(/[^a-z0-9一-鿿]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50) + '.html';

    // Save to database
    const { data: storyData, error: dbError } = await supabase
      .from('stories')
      .insert({
        title: title,
        filename: filename,
        content: generatedContent,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Failed to save story: ${dbError.message}`);
    }

    // Return success response
    const response: StoryResponse = {
      success: true,
      data: {
        id: storyData.id,
        title: storyData.title,
        content: storyData.content,
        created_at: storyData.created_at,
      },
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating story:', error);

    // Determine error code and status
    let errorCode = 'INTERNAL_ERROR';
    let statusCode = 500;

    if (error.message.includes('OpenAI API error')) {
      errorCode = 'AI_GENERATION_FAILED';
      statusCode = 502; // Bad Gateway
    } else if (error.message.includes('Failed to fetch')) {
      errorCode = 'AI_API_UNAVAILABLE';
      statusCode = 503; // Service Unavailable
    } else if (error.message.includes('timeout')) {
      errorCode = 'REQUEST_TIMEOUT';
      statusCode = 504; // Gateway Timeout
    }

    const errorResponse: StoryResponse = {
      success: false,
      error: {
        code: errorCode,
        message: error.message,
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: statusCode,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SEOWebhookPayload {
  event: 'seo.ranking_update' | 'seo.keyword_data' | 'seo.competitor_data' | 'seo.report_ready';
  timestamp: string;
  data: {
    domain?: string;
    keywords?: string[];
    rankings?: Record<string, any>;
    [key: string]: any;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: SEOWebhookPayload = await req.json();
    
    console.log('SEO webhook received:', {
      event: payload.event,
      domain: payload.data.domain,
      keywordCount: payload.data.keywords?.length || 0,
      timestamp: payload.timestamp,
    });

    // Process SEO-specific webhook logic here
    // For example: store ranking data, trigger alerts, etc.

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SEO webhook processed successfully',
        event: payload.event,
        receivedAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing SEO webhook:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsWebhookPayload {
  event: 'analytics.report' | 'analytics.traffic_spike' | 'analytics.goal_completed';
  timestamp: string;
  data: {
    source?: string;
    metric?: string;
    value?: number;
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

    const payload: AnalyticsWebhookPayload = await req.json();
    
    console.log('Analytics webhook received:', {
      event: payload.event,
      source: payload.data.source,
      metric: payload.data.metric,
      value: payload.data.value,
      timestamp: payload.timestamp,
    });

    // Process analytics-specific webhook logic here
    // For example: aggregate metrics, trigger dashboards, etc.

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Analytics webhook processed successfully',
        event: payload.event,
        receivedAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing analytics webhook:', error);
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse the webhook payload
    const payload: WebhookPayload = await req.json();
    
    console.log('Received webhook:', {
      event: payload.event,
      timestamp: payload.timestamp,
      dataKeys: Object.keys(payload.data || {}),
    });

    // Log the webhook to the database (you'll need to create a webhook_logs table)
    // For now, we'll just acknowledge receipt
    
    // You can add custom logic here based on the event type
    switch (payload.event) {
      case 'client.created':
        console.log('New client webhook received:', payload.data);
        break;
      case 'project.updated':
        console.log('Project update webhook received:', payload.data);
        break;
      case 'test':
        console.log('Test webhook received successfully');
        break;
      default:
        console.log('Unknown webhook event:', payload.event);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook received successfully',
        event: payload.event,
        receivedAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
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

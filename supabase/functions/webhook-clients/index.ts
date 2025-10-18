import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClientWebhookPayload {
  event: 'client.created' | 'client.updated' | 'client.deleted';
  timestamp: string;
  data: {
    id: string;
    name: string;
    email?: string;
    company?: string;
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

    const payload: ClientWebhookPayload = await req.json();
    
    console.log('Client webhook received:', {
      event: payload.event,
      clientId: payload.data.id,
      clientName: payload.data.name,
      timestamp: payload.timestamp,
    });

    // Process client-specific webhook logic here
    // For example: sync with CRM, send notifications, etc.

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Client webhook processed successfully',
        event: payload.event,
        clientId: payload.data.id,
        receivedAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing client webhook:', error);
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

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';
import { validateWebhookSignature, getWebhookSecret } from '../_shared/webhook-validator.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-signature',
};

interface OpportunityWebhookPayload {
  event: 'opportunity.created' | 'opportunity.updated' | 'opportunity.stage_changed' | 'opportunity.closed';
  timestamp: string;
  data: {
    id: string;
    title: string;
    stage?: string;
    value?: number;
    clientId?: string;
    [key: string]: any;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate webhook signature
    const signature = req.headers.get('x-webhook-signature');
    const body = await req.text();
    const secret = getWebhookSecret();

    const isValid = await validateWebhookSignature(body, signature, secret);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid signature' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: OpportunityWebhookPayload = JSON.parse(body);
    
    console.log('Opportunity webhook received:', {
      event: payload.event,
      opportunityId: payload.data.id,
      title: payload.data.title,
      stage: payload.data.stage,
      value: payload.data.value,
      timestamp: payload.timestamp,
    });

    // Process opportunity-specific webhook logic here
    // For example: update sales forecasts, send alerts, etc.

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Opportunity webhook processed successfully',
        event: payload.event,
        opportunityId: payload.data.id,
        receivedAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing opportunity webhook:', error);
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

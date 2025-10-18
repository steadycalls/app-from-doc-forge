import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProjectWebhookPayload {
  event: 'project.created' | 'project.updated' | 'project.completed' | 'project.deleted';
  timestamp: string;
  data: {
    id: string;
    name: string;
    status?: string;
    clientId?: string;
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

    const payload: ProjectWebhookPayload = await req.json();
    
    console.log('Project webhook received:', {
      event: payload.event,
      projectId: payload.data.id,
      projectName: payload.data.name,
      status: payload.data.status,
      timestamp: payload.timestamp,
    });

    // Process project-specific webhook logic here
    // For example: update timelines, notify team members, etc.

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Project webhook processed successfully',
        event: payload.event,
        projectId: payload.data.id,
        receivedAt: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing project webhook:', error);
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

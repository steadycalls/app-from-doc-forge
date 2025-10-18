import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Key, CheckCircle, AlertCircle, Copy, RefreshCw, Users, FolderKanban, TrendingUp, Search, BarChart } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const projectId = 'sqsxjmvayyygsivqgyzb';
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);

  const webhookEndpoints = [
    {
      name: 'Clients',
      icon: Users,
      endpoint: 'webhook-clients',
      description: 'Client creation, updates, and deletions',
      events: ['client.created', 'client.updated', 'client.deleted'],
    },
    {
      name: 'Projects',
      icon: FolderKanban,
      endpoint: 'webhook-projects',
      description: 'Project lifecycle events and status changes',
      events: ['project.created', 'project.updated', 'project.completed', 'project.deleted'],
    },
    {
      name: 'Opportunities',
      icon: TrendingUp,
      endpoint: 'webhook-opportunities',
      description: 'Sales opportunity updates and stage changes',
      events: ['opportunity.created', 'opportunity.updated', 'opportunity.stage_changed', 'opportunity.closed'],
    },
    {
      name: 'SEO',
      icon: Search,
      endpoint: 'webhook-seo',
      description: 'SEO rankings, keyword data, and competitor insights',
      events: ['seo.ranking_update', 'seo.keyword_data', 'seo.competitor_data', 'seo.report_ready'],
    },
    {
      name: 'Analytics',
      icon: BarChart,
      endpoint: 'webhook-analytics',
      description: 'Traffic data, metrics, and goal completions',
      events: ['analytics.report', 'analytics.traffic_spike', 'analytics.goal_completed'],
    },
  ];

  const integrations = [
    {
      name: 'DataForSEO',
      description: 'SEO data and keyword research API',
      status: 'connected',
      credentials: ['DATAFORSEO_LOGIN', 'DATAFORSEO_PASSWORD'],
    },
    {
      name: 'OpenAI',
      description: 'AI-powered reporting and content generation',
      status: 'connected',
      credentials: ['OPENAI_API_KEY'],
    },
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const testWebhook = async (endpoint: string, sampleEvent: string) => {
    setTestingWebhook(endpoint);
    const url = `https://${projectId}.supabase.co/functions/v1/${endpoint}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: sampleEvent,
          timestamp: new Date().toISOString(),
          data: { 
            id: 'test-' + Date.now(),
            message: 'Test webhook from settings',
          },
        }),
      });

      if (response.ok) {
        toast.success(`${endpoint} test successful`);
      } else {
        toast.error(`${endpoint} test failed`);
      }
    } catch (error) {
      toast.error('Failed to test webhook');
    } finally {
      setTestingWebhook(null);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your integrations and API keys</p>
        </div>

        <div className="space-y-6">
          {/* API Integrations */}
          <div>
            <h2 className="text-xl font-semibold mb-4">API Integrations</h2>
            <div className="grid gap-4">
              {integrations.map((integration) => (
                <Card key={integration.name} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Key className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">{integration.name}</h3>
                        <Badge variant={integration.status === 'connected' ? 'default' : 'secondary'}>
                          {integration.status === 'connected' ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Connected
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Not Connected
                            </>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{integration.description}</p>
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">Required Secrets:</p>
                        <div className="flex flex-wrap gap-2">
                          {integration.credentials.map((cred) => (
                            <Badge key={cred} variant="outline" className="text-xs font-mono">
                              {cred}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open(
                          `https://supabase.com/dashboard/project/${projectId}/settings/functions`,
                          '_blank'
                        );
                      }}
                    >
                      Manage Keys
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <Separator />

          {/* Inbound Webhooks */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Inbound Webhooks</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Each webhook endpoint is dedicated to a specific type of data for better organization and routing
            </p>
            
            <div className="space-y-4">
              {webhookEndpoints.map((webhook) => {
                const Icon = webhook.icon;
                const webhookUrl = `https://${projectId}.supabase.co/functions/v1/${webhook.endpoint}`;
                
                return (
                  <Card key={webhook.endpoint} className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 mb-2">
                          <Icon className="h-5 w-5 text-primary" />
                          <div>
                            <h3 className="font-semibold">{webhook.name} Webhook</h3>
                            <p className="text-sm text-muted-foreground">{webhook.description}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testWebhook(webhook.endpoint, webhook.events[0])}
                          disabled={testingWebhook === webhook.endpoint}
                        >
                          {testingWebhook === webhook.endpoint ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            'Test'
                          )}
                        </Button>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <code className="flex-1 bg-muted px-3 py-2 rounded text-xs font-mono break-all">
                            {webhookUrl}
                          </code>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(webhookUrl)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Supported Events:</p>
                        <div className="flex flex-wrap gap-2">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs font-mono">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <Card className="p-6 mt-4 bg-muted/50">
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Security Note
              </h4>
              <p className="text-xs text-muted-foreground">
                These endpoints are public but should verify webhook signatures in production. 
                Consider implementing authentication or signature verification for external webhooks.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;

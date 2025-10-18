import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Key, CheckCircle, AlertCircle, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const projectId = 'sqsxjmvayyygsivqgyzb';
  const [testingWebhook, setTestingWebhook] = useState(false);

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

  const webhookUrl = `https://${projectId}.supabase.co/functions/v1/webhook-receiver`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const testWebhook = async () => {
    setTestingWebhook(true);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test',
          timestamp: new Date().toISOString(),
          data: { message: 'Test webhook from settings' },
        }),
      });

      if (response.ok) {
        toast.success('Webhook test successful');
      } else {
        toast.error('Webhook test failed');
      }
    } catch (error) {
      toast.error('Failed to test webhook');
    } finally {
      setTestingWebhook(false);
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
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Webhook Endpoint</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Use this URL to receive webhooks from external services
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-4 py-2 rounded text-sm font-mono break-all">
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

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Test Webhook</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Send a test webhook to verify your endpoint is working
                  </p>
                  <Button
                    onClick={testWebhook}
                    disabled={testingWebhook}
                    variant="outline"
                  >
                    {testingWebhook ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Send Test Webhook'
                    )}
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Expected Payload Format</h3>
                  <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
{`{
  "event": "string",
  "timestamp": "ISO 8601 string",
  "data": {
    // Your custom data
  }
}`}
                  </pre>
                </div>

                <Separator />

                <div className="bg-muted/50 p-4 rounded">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Security Note
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    This endpoint is public but should verify webhook signatures in production. 
                    Consider implementing authentication or signature verification for external webhooks.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;

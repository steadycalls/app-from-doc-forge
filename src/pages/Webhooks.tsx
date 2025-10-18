import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Webhook, Trash2, RefreshCw, Copy, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { storage, STORAGE_KEYS } from '@/lib/storage';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: 'active' | 'inactive';
  secret: string;
  createdAt: string;
}

const eventTypes = [
  'client.created',
  'client.updated',
  'project.created',
  'project.updated',
  'opportunity.created',
  'opportunity.updated',
];

const Webhooks = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>(() => {
    return storage.get(STORAGE_KEYS.WEBHOOKS) || [];
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);

  const generateSecret = () => {
    return 'whsec_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const webhook: WebhookConfig = {
      id: editingWebhook?.id || crypto.randomUUID(),
      name: formData.get('name') as string,
      url: formData.get('url') as string,
      events: Array.from(formData.getAll('events')) as string[],
      status: 'active',
      secret: editingWebhook?.secret || generateSecret(),
      createdAt: editingWebhook?.createdAt || new Date().toISOString(),
    };

    const updatedWebhooks = editingWebhook
      ? webhooks.map(w => w.id === webhook.id ? webhook : w)
      : [...webhooks, webhook];

    setWebhooks(updatedWebhooks);
    storage.set(STORAGE_KEYS.WEBHOOKS, updatedWebhooks);
    toast.success(editingWebhook ? 'Webhook updated' : 'Webhook created');
    setIsDialogOpen(false);
    setEditingWebhook(null);
  };

  const handleDelete = (id: string) => {
    const updatedWebhooks = webhooks.filter(w => w.id !== id);
    setWebhooks(updatedWebhooks);
    storage.set(STORAGE_KEYS.WEBHOOKS, updatedWebhooks);
    toast.success('Webhook deleted');
  };

  const toggleStatus = (id: string) => {
    const updatedWebhooks = webhooks.map(w =>
      w.id === id ? { ...w, status: w.status === 'active' ? 'inactive' : 'active' } as WebhookConfig : w
    );
    setWebhooks(updatedWebhooks);
    storage.set(STORAGE_KEYS.WEBHOOKS, updatedWebhooks);
    toast.success('Webhook status updated');
  };

  const copySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret copied to clipboard');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Webhooks</h1>
            <p className="text-muted-foreground mt-1">Configure webhooks to receive real-time notifications</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingWebhook(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Webhook
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingWebhook ? 'Edit' : 'Create'} Webhook</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingWebhook?.name}
                    placeholder="My Integration"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">Webhook URL</Label>
                  <Input
                    id="url"
                    name="url"
                    type="url"
                    defaultValue={editingWebhook?.url}
                    placeholder="https://api.example.com/webhooks"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Events to Subscribe</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {eventTypes.map((event) => (
                      <label key={event} className="flex items-center gap-2 p-2 border rounded hover:bg-accent cursor-pointer">
                        <input
                          type="checkbox"
                          name="events"
                          value={event}
                          defaultChecked={editingWebhook?.events.includes(event)}
                          className="rounded"
                        />
                        <span className="text-sm">{event}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingWebhook ? 'Update' : 'Create'} Webhook
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {webhooks.length === 0 ? (
          <Card className="p-12 text-center">
            <Webhook className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No webhooks configured</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first webhook endpoint
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{webhook.name}</h3>
                      <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                        {webhook.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground break-all">{webhook.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleStatus(webhook.id)}
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingWebhook(webhook);
                        setIsDialogOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(webhook.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Events</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {webhook.events.map((event) => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-muted-foreground">Signing Secret</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="flex-1 bg-muted px-3 py-1 rounded text-xs font-mono">
                        {webhook.secret}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copySecret(webhook.secret)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Webhooks;

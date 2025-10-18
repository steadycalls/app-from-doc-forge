import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Mail, Phone, Building, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

interface Client {
  id: string;
  company_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'lead';
  tags: string[];
  created_at: string;
}

const Clients = () => {
  const { currentOrganization } = useOrganization();
  const [clients, setClients] = useState<Client[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchClients = async () => {
    if (!currentOrganization) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('organization_id', currentOrganization.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load clients');
      console.error(error);
    } else {
      setClients(data || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, [currentOrganization]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentOrganization) return;

    const formData = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    const clientData = {
      company_name: formData.get('companyName') as string,
      first_name: formData.get('firstName') as string,
      last_name: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      status: formData.get('status') as Client['status'],
      tags: (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean),
      organization_id: currentOrganization.id,
      user_id: user.id,
    };

    if (editingClient) {
      const { error } = await supabase
        .from('clients')
        .update(clientData)
        .eq('id', editingClient.id);

      if (error) {
        toast.error('Failed to update client');
        console.error(error);
      } else {
        toast.success('Client updated successfully');
        fetchClients();
      }
    } else {
      const { error } = await supabase
        .from('clients')
        .insert(clientData);

      if (error) {
        toast.error('Failed to add client');
        console.error(error);
      } else {
        toast.success('Client added successfully');
        fetchClients();
      }
    }

    setIsDialogOpen(false);
    setEditingClient(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete client');
      console.error(error);
    } else {
      toast.success('Client deleted successfully');
      fetchClients();
    }
  };

  const statusColors = {
    active: 'bg-success/10 text-success border-success',
    inactive: 'bg-muted/10 text-muted-foreground border-muted',
    lead: 'bg-warning/10 text-warning border-warning',
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Clients</h1>
            <p className="text-muted-foreground">Manage your client contacts and relationships</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingClient(null)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="companyName"
                        name="companyName"
                        placeholder="Acme Corp"
                        className="pl-10"
                        defaultValue={editingClient?.company_name}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={editingClient?.status || 'lead'} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      defaultValue={editingClient?.first_name}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      defaultValue={editingClient?.last_name}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        className="pl-10"
                        defaultValue={editingClient?.email}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="+1 (555) 123-4567"
                        className="pl-10"
                        defaultValue={editingClient?.phone}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    placeholder="ecommerce, priority, enterprise"
                    defaultValue={editingClient?.tags.join(', ')}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingClient ? 'Update' : 'Add'} Client
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>All Clients ({clients.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No clients yet. Add your first client to get started.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Client
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{client.company_name}</h3>
                        <Badge variant="outline" className={statusColors[client.status]}>
                          {client.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {client.first_name} {client.last_name}
                      </p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {client.email}
                        </span>
                        {client.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {client.phone}
                          </span>
                        )}
                      </div>
                      {client.tags.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {client.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingClient(client);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(client.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Clients;

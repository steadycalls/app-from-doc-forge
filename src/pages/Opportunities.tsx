import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, DollarSign, Percent } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { toast } from 'sonner';

interface Opportunity {
  id: string;
  name: string;
  clientId: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  value: number;
  probability: number;
  closeDate: string;
  createdAt: string;
}

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

  useEffect(() => {
    const savedOpportunities = storage.get<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES) || [];
    const savedClients = storage.get<any[]>(STORAGE_KEYS.CLIENTS) || [];
    setOpportunities(savedOpportunities);
    setClients(savedClients);
  }, []);

  const saveOpportunities = (updatedOpportunities: Opportunity[]) => {
    setOpportunities(updatedOpportunities);
    storage.set(STORAGE_KEYS.OPPORTUNITIES, updatedOpportunities);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const opportunityData: Opportunity = {
      id: editingOpportunity?.id || crypto.randomUUID(),
      name: formData.get('name') as string,
      clientId: formData.get('clientId') as string,
      stage: formData.get('stage') as Opportunity['stage'],
      value: parseFloat(formData.get('value') as string) || 0,
      probability: parseFloat(formData.get('probability') as string) || 0,
      closeDate: formData.get('closeDate') as string,
      createdAt: editingOpportunity?.createdAt || new Date().toISOString(),
    };

    if (editingOpportunity) {
      saveOpportunities(opportunities.map(o => o.id === editingOpportunity.id ? opportunityData : o));
      toast.success('Opportunity updated successfully');
    } else {
      saveOpportunities([...opportunities, opportunityData]);
      toast.success('Opportunity added successfully');
    }

    setIsDialogOpen(false);
    setEditingOpportunity(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this opportunity?')) {
      saveOpportunities(opportunities.filter(o => o.id !== id));
      toast.success('Opportunity deleted successfully');
    }
  };

  const stageColors = {
    lead: 'bg-muted/10 text-muted-foreground border-muted',
    qualified: 'bg-info/10 text-info border-info',
    proposal: 'bg-warning/10 text-warning border-warning',
    negotiation: 'bg-warning/10 text-warning border-warning',
    'closed-won': 'bg-success/10 text-success border-success',
    'closed-lost': 'bg-destructive/10 text-destructive border-destructive',
  };

  const totalValue = opportunities.reduce((sum, opp) => sum + opp.value, 0);
  const weightedValue = opportunities.reduce((sum, opp) => sum + (opp.value * opp.probability / 100), 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Opportunities</h1>
            <p className="text-muted-foreground">Track your sales pipeline and revenue</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingOpportunity(null)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Opportunity
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Opportunity Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Q1 Website Project"
                    defaultValue={editingOpportunity?.name}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">Client</Label>
                    <Select name="clientId" defaultValue={editingOpportunity?.clientId} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <Select name="stage" defaultValue={editingOpportunity?.stage || 'lead'} required>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                        <SelectItem value="closed-won">Closed Won</SelectItem>
                        <SelectItem value="closed-lost">Closed Lost</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">Value ($)</Label>
                    <Input
                      id="value"
                      name="value"
                      type="number"
                      placeholder="25000"
                      defaultValue={editingOpportunity?.value}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="probability">Probability (%)</Label>
                    <Input
                      id="probability"
                      name="probability"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="75"
                      defaultValue={editingOpportunity?.probability}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closeDate">Expected Close</Label>
                    <Input
                      id="closeDate"
                      name="closeDate"
                      type="date"
                      defaultValue={editingOpportunity?.closeDate}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingOpportunity ? 'Update' : 'Add'} Opportunity
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{opportunities.length} opportunities</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Weighted Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">${weightedValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Based on probability</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {opportunities.length > 0
                  ? Math.round((opportunities.filter(o => o.stage === 'closed-won').length / opportunities.length) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">Of closed deals</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>All Opportunities ({opportunities.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {opportunities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No opportunities yet. Track your first sales opportunity.</p>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Opportunity
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {opportunities.map((opportunity) => {
                  const client = clients.find(c => c.id === opportunity.clientId);
                  return (
                    <div
                      key={opportunity.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{opportunity.name}</h3>
                          <Badge variant="outline" className={stageColors[opportunity.stage]}>
                            {opportunity.stage}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{client?.companyName || 'Unknown Client'}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${opportunity.value.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            {opportunity.probability}% probability
                          </span>
                          <span>Close: {new Date(opportunity.closeDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingOpportunity(opportunity);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDelete(opportunity.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Opportunities;

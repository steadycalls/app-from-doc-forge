import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Edit, Calendar, DollarSign, Users, TrendingUp, Clock } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/lib/storage';
import { toast } from 'sonner';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  clientId: string;
  value: number;
  probability: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  expectedCloseDate: string;
  createdAt: string;
}

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const opportunities = (storage.get(STORAGE_KEYS.OPPORTUNITIES) || []) as Opportunity[];
    const foundOpp = opportunities.find((o: Opportunity) => o.id === id);
    
    if (!foundOpp) {
      toast.error('Opportunity not found');
      navigate('/opportunities');
      return;
    }
    
    setOpportunity(foundOpp);

    // Load client details
    const clients = (storage.get(STORAGE_KEYS.CLIENTS) || []) as any[];
    const oppClient = clients.find((c: any) => c.id === foundOpp.clientId);
    setClient(oppClient);
  }, [id, navigate]);

  if (!opportunity) {
    return null;
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'lead': return 'secondary';
      case 'qualified': return 'default';
      case 'proposal': return 'default';
      case 'negotiation': return 'default';
      case 'closed-won': return 'outline';
      case 'closed-lost': return 'destructive';
      default: return 'secondary';
    }
  };

  const weightedValue = (opportunity.value * opportunity.probability) / 100;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/opportunities')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{opportunity.title}</h1>
            <p className="text-muted-foreground">{opportunity.description}</p>
            {client && (
              <Button
                variant="link"
                className="px-0 mt-2"
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <Users className="h-4 w-4 mr-2" />
                {client.name} - {client.company}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant={getStageColor(opportunity.stage)}>
              {opportunity.stage.replace('-', ' ')}
            </Badge>
            <Button onClick={() => navigate('/opportunities')}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Opportunity
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-medium">Deal Value</span>
            </div>
            <p className="text-2xl font-bold">${opportunity.value.toLocaleString()}</p>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Probability</span>
            </div>
            <p className="text-2xl font-bold">{opportunity.probability}%</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-medium">Weighted Value</span>
            </div>
            <p className="text-2xl font-bold">${weightedValue.toLocaleString()}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Expected Close</span>
            </div>
            <p className="text-lg font-semibold">
              {new Date(opportunity.expectedCloseDate).toLocaleDateString()}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Deal Progress</h3>
          <Progress value={opportunity.probability} className="h-3" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>Probability: {opportunity.probability}%</span>
            <span>Stage: {opportunity.stage.replace('-', ' ')}</span>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Sales Pipeline</h3>
            <div className="space-y-4">
              {['lead', 'qualified', 'proposal', 'negotiation', 'closed-won'].map((stage, idx) => {
                const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
                const currentIdx = stages.indexOf(opportunity.stage);
                const isActive = idx <= currentIdx;
                const isCurrent = stage === opportunity.stage;
                
                return (
                  <div key={stage} className="flex items-start gap-4">
                    <div className={`h-2 w-2 rounded-full mt-2 ${isActive ? 'bg-primary' : 'bg-muted'}`} />
                    <div className="flex-1">
                      <p className={`font-medium capitalize ${isCurrent ? 'text-primary' : ''}`}>
                        {stage.replace('-', ' ')}
                      </p>
                      {isCurrent && (
                        <p className="text-sm text-muted-foreground">Current stage</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Deal Details</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Stage</Label>
                <p className="font-medium capitalize">{opportunity.stage.replace('-', ' ')}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Deal Size</Label>
                <p className="font-medium">${opportunity.value.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Win Probability</Label>
                <p className="font-medium">{opportunity.probability}%</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Expected Revenue</Label>
                <p className="font-medium">${weightedValue.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Created</Label>
                <p className="font-medium">{new Date(opportunity.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

const Label = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={className}>{children}</div>
);

export default OpportunityDetail;

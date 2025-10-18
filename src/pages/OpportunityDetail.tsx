import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Edit, DollarSign, Percent, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

const OpportunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentOrganization || !id) return;
      
      setIsLoading(true);

      // Fetch opportunity
      const { data: oppData, error: oppError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .eq('organization_id', currentOrganization.id)
        .single();

      if (oppError) {
        toast.error('Opportunity not found');
        navigate('/opportunities');
        return;
      }

      setOpportunity(oppData);

      // Fetch associated client
      if (oppData.client_id) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', oppData.client_id)
          .single();

        setClient(clientData);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [id, currentOrganization, navigate]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (!opportunity) {
    return null;
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'qualified': return 'default';
      case 'proposal': return 'secondary';
      case 'negotiation': return 'outline';
      case 'closed': return 'default';
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
          <div>
            <h1 className="text-3xl font-bold mb-2">{opportunity.name}</h1>
            {opportunity.description && (
              <p className="text-muted-foreground mb-4">{opportunity.description}</p>
            )}
            {client && (
              <p className="text-sm text-muted-foreground">
                Client: <span className="font-medium">{client.company_name}</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant={getStageColor(opportunity.stage)}>
              {opportunity.stage}
            </Badge>
            <Button onClick={() => navigate('/opportunities')}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Opportunity
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-medium">Deal Value</span>
            </div>
            <p className="text-2xl font-bold">${opportunity.value?.toLocaleString() || 0}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Percent className="h-5 w-5" />
              <span className="text-sm font-medium">Probability</span>
            </div>
            <p className="text-2xl font-bold">{opportunity.probability || 0}%</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Weighted Value</span>
            </div>
            <p className="text-2xl font-bold">${weightedValue.toLocaleString()}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Expected Close</span>
            </div>
            <p className="text-lg font-bold">
              {opportunity.expected_close_date 
                ? new Date(opportunity.expected_close_date).toLocaleDateString() 
                : 'Not set'}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Deal Progress</h3>
          <Progress value={opportunity.probability || 0} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {opportunity.probability || 0}% probability of closing
          </p>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Sales Pipeline</h3>
            <div className="space-y-3">
              {['lead', 'qualified', 'proposal', 'negotiation', 'closed'].map((stage) => (
                <div key={stage} className="flex items-center gap-3">
                  <div 
                    className={`h-2 w-2 rounded-full ${
                      opportunity.stage === stage ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                  <Label className={opportunity.stage === stage ? 'font-medium' : 'text-muted-foreground'}>
                    {stage.charAt(0).toUpperCase() + stage.slice(1)}
                  </Label>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Deal Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Stage</span>
                <Badge variant="outline">{opportunity.stage}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Value</span>
                <span className="font-medium">${opportunity.value?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Probability</span>
                <span className="font-medium">{opportunity.probability || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Weighted Value</span>
                <span className="font-medium">${weightedValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="font-medium">
                  {new Date(opportunity.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default OpportunityDetail;
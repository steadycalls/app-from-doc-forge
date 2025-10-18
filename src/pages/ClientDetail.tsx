import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Phone, Globe, MapPin, Edit, Calendar, FolderKanban, TrendingUp, Loader2 } from 'lucide-react';
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
  address?: string;
  status: 'active' | 'inactive' | 'lead';
  created_at: string;
}

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentOrganization || !id) return;
      
      setIsLoading(true);

      // Fetch client
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .eq('organization_id', currentOrganization.id)
        .single();

      if (clientError) {
        toast.error('Client not found');
        navigate('/clients');
        return;
      }

      setClient(clientData);

      // Fetch related projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', id)
        .eq('organization_id', currentOrganization.id);

      setProjects(projectsData || []);

      // Fetch related opportunities
      const { data: opportunitiesData } = await supabase
        .from('opportunities')
        .select('*')
        .eq('client_id', id)
        .eq('organization_id', currentOrganization.id);

      setOpportunities(opportunitiesData || []);
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

  if (!client) {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/clients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{client.company_name}</h1>
            <p className="text-lg text-muted-foreground">
              {client.first_name} {client.last_name}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant={
              client.status === 'active' ? 'default' :
              client.status === 'inactive' ? 'secondary' : 'outline'
            }>
              {client.status}
            </Badge>
            <Button onClick={() => navigate('/clients')}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Client
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Mail className="h-5 w-5" />
              <span className="text-sm font-medium">Email</span>
            </div>
            <p className="text-sm">{client.email}</p>
          </Card>
          
          {client.phone && (
            <Card className="p-6">
              <div className="flex items-center gap-3 text-muted-foreground mb-2">
                <Phone className="h-5 w-5" />
                <span className="text-sm font-medium">Phone</span>
              </div>
              <p className="text-sm">{client.phone}</p>
            </Card>
          )}

          {client.address && (
            <Card className="p-6">
              <div className="flex items-center gap-3 text-muted-foreground mb-2">
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-medium">Address</span>
              </div>
              <p className="text-sm">{client.address}</p>
            </Card>
          )}

          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Created</span>
            </div>
            <p className="text-sm">{new Date(client.created_at).toLocaleDateString()}</p>
          </Card>
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList>
            <TabsTrigger value="projects">
              <FolderKanban className="h-4 w-4 mr-2" />
              Projects ({projects.length})
            </TabsTrigger>
            <TabsTrigger value="opportunities">
              <TrendingUp className="h-4 w-4 mr-2" />
              Opportunities ({opportunities.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            {projects.length === 0 ? (
              <Card className="p-12 text-center">
                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
                <p className="text-muted-foreground mb-4">Create a project for this client</p>
                <Button onClick={() => navigate('/projects')}>Create Project</Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {projects.map((project) => (
                  <Card key={project.id} className="p-6 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => navigate(`/projects/${project.id}`)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold mb-2">{project.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                        <Badge variant="outline">{project.status}</Badge>
                      </div>
                      <Badge variant="secondary">${project.budget?.toLocaleString()}</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            {opportunities.length === 0 ? (
              <Card className="p-12 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No opportunities yet</h3>
                <p className="text-muted-foreground mb-4">Track sales opportunities for this client</p>
                <Button onClick={() => navigate('/opportunities')}>Create Opportunity</Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {opportunities.map((opp) => (
                  <Card key={opp.id} className="p-6 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => navigate(`/opportunities/${opp.id}`)}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold mb-2">{opp.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{opp.description}</p>
                        <Badge variant="outline">{opp.stage}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">${opp.value?.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{opp.probability}% probability</div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ClientDetail;
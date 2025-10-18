import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Edit, Calendar, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentOrganization } = useOrganization();
  const [project, setProject] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentOrganization || !id) return;
      
      setIsLoading(true);

      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('organization_id', currentOrganization.id)
        .single();

      if (projectError) {
        toast.error('Project not found');
        navigate('/projects');
        return;
      }

      setProject(projectData);

      // Fetch associated client
      if (projectData.client_id) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', projectData.client_id)
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

  if (!project) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-success';
      case 'completed': return 'bg-primary';
      case 'on-hold': return 'bg-warning';
      case 'planning': return 'bg-info';
      default: return 'bg-muted';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
            {project.description && (
              <p className="text-muted-foreground mb-4">{project.description}</p>
            )}
            {client && (
              <p className="text-sm text-muted-foreground">
                Client: <span className="font-medium">{client.company_name}</span>
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <Button onClick={() => navigate('/projects')}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <DollarSign className="h-5 w-5" />
              <span className="text-sm font-medium">Budget</span>
            </div>
            <p className="text-2xl font-bold">${project.budget?.toLocaleString() || 0}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Start Date</span>
            </div>
            <p className="text-2xl font-bold">
              {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <Calendar className="h-5 w-5" />
              <span className="text-sm font-medium">Deadline</span>
            </div>
            <p className="text-2xl font-bold">
              {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
            </p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 text-muted-foreground mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium">Progress</span>
            </div>
            <p className="text-2xl font-bold">{project.progress || 0}%</p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
          <Progress value={project.progress || 0} className="h-2" />
          <p className="text-sm text-muted-foreground mt-2">
            {project.progress || 0}% Complete
          </p>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Start Date</span>
                <span className="font-medium">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Deadline</span>
                <span className="font-medium">
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Not set'}
                </span>
              </div>
              {project.start_date && project.deadline && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Duration</span>
                  <span className="font-medium">
                    {Math.ceil((new Date(project.deadline).getTime() - new Date(project.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Project Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline">{project.status}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Priority</span>
                <Badge variant="outline">{project.priority}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Budget</span>
                <span className="font-medium">${project.budget?.toLocaleString() || 0}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProjectDetail;
